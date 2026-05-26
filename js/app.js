import { restaurants } from './data.js?v=20260526';
import { parseNaturalLanguage, formatDSL } from './dsl.js';
import { verifyPredicates, verifyCritical } from './verifier.js';
import { generateFeedback } from './feedback.js';
import { renderRestaurantList, renderInputArea, highlightRestaurants } from './ui-reserve.js';
import { initAnimationPanel, resetPanel, runStep } from './animation.js';
import { renderComparePage } from './ui-compare.js';
import { personas, getPersonaById } from './personas.js';
import { recommendTopN } from './recommender.js';
import { renderPersonaCards, renderMemoryPanel } from './ui-persona.js';
import { renderHexagon } from './ui-hexagon.js';
import { renderSmsCard, clearSmsCard } from './ui-sms.js';

// ===== 标签切换 =====
const tabs = document.querySelectorAll('.tab');
const pages = document.querySelectorAll('.page');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.page;
    tabs.forEach(t => t.classList.toggle('active', t === tab));
    pages.forEach(p => p.classList.toggle('active', p.id === `page-${target}`));
  });
});

// ===== 当前客户档案状态 =====
let currentPersona = personas[0];

const personaPanel = document.getElementById('persona-panel');
const memoryPanel  = document.getElementById('memory-panel');
const hexagonPanel = document.getElementById('hexagon-panel');
const smsPanel     = document.getElementById('sms-panel');

function refreshForCurrentPersona({ clearSms = true } = {}) {
  renderPersonaCards(personaPanel, currentPersona.id, switchPersona);
  renderMemoryPanel(memoryPanel, currentPersona);
  const recs = recommendTopN(currentPersona, restaurants, 3);
  renderHexagon(hexagonPanel, recs);
  if (clearSms) clearSmsCard(smsPanel);
}

function switchPersona(p) {
  currentPersona = p;
  refreshForCurrentPersona({ clearSms: true });
}

// ===== 验证流程编排 =====
function formatChecks(checks) {
  return checks.map(c =>
    `<div class="check-item ${c.passed ? 'pass' : 'fail'}">${c.label} — ${c.reason}</div>`
  ).join('');
}

let running = false;

async function runVerification(text) {
  if (running) return;
  running = true;

  resetPanel();
  highlightRestaurants([], []);
  clearSmsCard(smsPanel);

  // 步骤 1：指令解析
  await runStep('parse', {
    bodyHtml: `<div>用户输入：<b>${text}</b></div><div style="margin-top:4px;color:#64748b">当前档案：${currentPersona.emoji} ${currentPersona.name}</div>`,
    passed: true
  });

  // 步骤 2：DSL 生成
  const rules = parseNaturalLanguage(text);
  const constraints = rules.filter(r => r.type === 'CONSTRAINT');

  if (constraints.length === 0) {
    await runStep('dsl', {
      bodyHtml: '<div style="color:#f59e0b">⚠ 未能提取到足够的约束条件，请补充更多信息（如时间、人数、评分等）</div>',
      passed: false
    });
    await runStep('predicate', { bodyHtml: '', passed: false });
    await runStep('critical', { bodyHtml: '', passed: false });
    await runStep('result', {
      bodyHtml: '<b style="color:#ef4444">信息不足，无法执行</b><br>建议：请补充时间、人数、评分等具体需求',
      passed: false
    });
    running = false;
    return;
  }

  await runStep('dsl', {
    bodyHtml: `<div>生成 ${rules.length} 条规则：</div><div class="dsl-code">${formatDSL(rules)}</div>`,
    passed: true
  });

  // 筛选通过验证的餐厅
  const matched = [];
  const rejected = [];
  const resultsById = {};

  for (const r of restaurants) {
    const res = verifyPredicates(rules, r);
    resultsById[r.id] = res;
    if (res.passed) matched.push(r.id); else rejected.push(r.id);
  }

  highlightRestaurants(matched, rejected);

  // 使用推荐器对通过验证的餐厅做 6 维评分，选最高分作为最佳推荐
  let bestRestaurant = null;
  let bestResult = null;
  let topRecs = [];

  if (matched.length > 0) {
    const matchedRestaurants = restaurants.filter(r => matched.includes(r.id));
    topRecs = recommendTopN(currentPersona, matchedRestaurants, 3);
    bestRestaurant = topRecs[0].restaurant;
    bestResult = resultsById[bestRestaurant.id];
  } else {
    // 没有餐厅通过验证，找失败最少的那家来做反馈
    let minFail = Infinity;
    for (const r of restaurants) {
      const failCount = resultsById[r.id].checks.filter(c => !c.passed).length;
      if (failCount < minFail) {
        minFail = failCount;
        bestRestaurant = r;
        bestResult = resultsById[r.id];
      }
    }
    // 六边形仍显示当前档案对全部餐厅的默认 Top-3（不限制通过验证）
    topRecs = recommendTopN(currentPersona, restaurants, 3);
  }

  // 刷新六边形（Top-3）
  renderHexagon(hexagonPanel, topRecs);

  // 步骤 3：谓词级
  await runStep('predicate', {
    bodyHtml: `<div>针对【${bestRestaurant.name}】的逐项校验：</div>${formatChecks(bestResult.checks)}`,
    passed: bestResult.passed
  });

  // 步骤 4：规则级
  const critical = verifyCritical(rules, bestResult);
  const critHtml = critical.details.length > 0
    ? critical.details.map(d =>
        `<div class="check-item ${d.passed ? 'pass' : 'fail'}">${d.label}${d.note ? ' — ' + d.note : ''}</div>`
      ).join('')
    : '<div style="color:#94a3b8">无关键规则需要验证</div>';

  await runStep('critical', {
    bodyHtml: critHtml,
    passed: critical.passed
  });

  // 步骤 5：结果
  if (bestResult.passed && critical.passed) {
    const note = critical.requiresConfirmation
      ? '<br><span style="color:#f59e0b">⚠ 支付操作需要您的二次确认</span>'
      : '';
    const recommendedReason = topRecs[0]
      ? `<br><span style="color:#64748b;font-size:13px">推荐依据：综合分 ${topRecs[0].overall.toFixed(0)} / 100（结合「${currentPersona.name}」的偏好与历史记忆）</span>`
      : '';
    await runStep('result', {
      bodyHtml: `<b style="color:#10b981">✓ 预约验证通过</b>${note}<br>推荐餐厅：<b>${bestRestaurant.name}</b>（${bestRestaurant.cuisine}，★${bestRestaurant.rating}）${recommendedReason}`,
      passed: true
    });

    // 触发短信
    if (topRecs[0]) {
      renderSmsCard(smsPanel, currentPersona, topRecs[0], rules);
    }
  } else {
    const failedChecks = bestResult.checks.filter(c => !c.passed);
    const fb = generateFeedback(rules, bestRestaurant, failedChecks, restaurants);
    const reasonHtml = fb.reasons.length > 0
      ? `<div style="margin:4px 0">原因：${fb.reasons.join('；')}</div>`
      : '';
    const suggestHtml = fb.suggestions.length > 0
      ? fb.suggestions.map(s => `<div style="color:#3b82f6">→ ${s.message}</div>`).join('')
      : '<div style="color:#64748b">→ 建议调整搜索条件后重试</div>';

    await runStep('result', {
      bodyHtml: `<b style="color:#ef4444">✗ 操作已被拦截</b>${reasonHtml}${suggestHtml}`,
      passed: false
    });
  }

  running = false;
}

// ===== 初始化 =====
refreshForCurrentPersona({ clearSms: true });
renderRestaurantList();
initAnimationPanel();
renderInputArea((text) => runVerification(text));
renderComparePage();

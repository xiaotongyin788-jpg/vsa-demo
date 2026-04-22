import { scenarios } from './scenarios.js';
import { restaurants } from './data.js';
import { parseNaturalLanguage } from './dsl.js';
import { verifyPredicates, verifyCritical } from './verifier.js';

const counters = { total: 0, badErrors: 0, goodIntercepts: 0 };

export function renderComparePage() {
  const root = document.getElementById('compare-root');
  root.innerHTML = `
    <div class="compare-controls">
      <h2>选择场景对比</h2>
      <div class="cmp-scenarios"></div>
    </div>
    <div class="compare-split">
      <div class="cmp-side cmp-bad">
        <div class="cmp-title">\u274c 无 VSA（直接执行）</div>
        <div class="cmp-content" id="cmp-bad-content"><div style="color:#94a3b8">请选择场景...</div></div>
      </div>
      <div class="cmp-side cmp-good">
        <div class="cmp-title">\u2705 有 VSA（验证后执行）</div>
        <div class="cmp-content" id="cmp-good-content"><div style="color:#94a3b8">请选择场景...</div></div>
      </div>
    </div>
    <div class="compare-stats" id="cmp-stats"></div>
  `;

  const scRow = root.querySelector('.cmp-scenarios');
  for (const s of scenarios) {
    const btn = document.createElement('button');
    btn.className = `scenario-btn color-${s.color}`;
    btn.innerHTML = `<span class="sc-icon">${s.icon}</span><span class="sc-label">${s.label}</span>`;
    btn.addEventListener('click', () => runCompare(s));
    scRow.appendChild(btn);
  }

  updateStats();
}

function runCompare(scenario) {
  counters.total++;

  const rules = parseNaturalLanguage(scenario.input);

  // 无 VSA
  const bad = simulateNaive(scenario);
  document.getElementById('cmp-bad-content').innerHTML = bad.html;
  if (bad.hasError) counters.badErrors++;

  // 有 VSA
  const good = simulateVSA(scenario, rules);
  document.getElementById('cmp-good-content').innerHTML = good.html;
  if (good.intercepted) counters.goodIntercepts++;

  updateStats();
}

function simulateNaive(scenario) {
  const r = restaurants[0];
  const hasRisk = scenario.expected !== 'pass';
  return {
    hasError: hasRisk,
    html: `
      <div><b>输入：</b>${scenario.input}</div>
      <div class="cmp-action">\u2192 AI 直接在【${r.name}】执行操作</div>
      ${hasRisk
        ? `<div class="cmp-error">\u2717 操作错误：${explainError(scenario)}</div>`
        : `<div class="cmp-ok">\u2713 碰巧执行成功（无安全保障）</div>`}
    `
  };
}

function simulateVSA(scenario, rules) {
  let matchedR = null;
  let result = null;
  for (const r of restaurants) {
    const res = verifyPredicates(rules, r);
    if (res.passed) { matchedR = r; result = res; break; }
  }
  if (!matchedR) {
    matchedR = restaurants[0];
    result = verifyPredicates(rules, matchedR);
  }
  const crit = verifyCritical(rules, result);
  const allPassed = result.passed && crit.passed && !crit.requiresConfirmation;
  const intercepted = !result.passed || !crit.passed || crit.requiresConfirmation;

  let resultHtml;
  if (result.passed && crit.passed && !crit.requiresConfirmation) {
    resultHtml = `
      <div><b>输入：</b>${scenario.input}</div>
      <div>\u2192 VSA 验证通过（${result.checks.length} 项检查）</div>
      <div class="cmp-ok">\u2713 在【${matchedR.name}】安全预约成功</div>
    `;
  } else if (crit.requiresConfirmation) {
    resultHtml = `
      <div><b>输入：</b>${scenario.input}</div>
      <div>\u2192 VSA 检测到高风险操作</div>
      <div class="cmp-intercept">\u26a0 已拦截：需要用户二次确认支付</div>
      <div class="cmp-advice">\u2192 保护用户资金安全</div>
    `;
  } else {
    const failReason = result.checks.find(c => !c.passed)?.reason || '约束未满足';
    resultHtml = `
      <div><b>输入：</b>${scenario.input}</div>
      <div>\u2192 VSA 发现问题，阻止执行</div>
      <div class="cmp-intercept">\u26a0 已拦截：${failReason}</div>
      <div class="cmp-advice">\u2192 引导用户调整条件或推荐替代方案</div>
    `;
  }

  return { intercepted, html: resultHtml };
}

function explainError(s) {
  switch (s.expected) {
    case 'predicate-fail': return '不满足用户条件，但未经检查直接执行';
    case 'critical-intercept': return '直接支付了可疑金额，未经确认';
    case 'missing-info': return '信息不全，AI 猜测执行，结果不可控';
    default: return '未经验证直接执行，存在风险';
  }
}

function updateStats() {
  const el = document.getElementById('cmp-stats');
  const badRate = counters.total ? Math.round(counters.badErrors / counters.total * 100) : 0;
  const goodRate = counters.total ? Math.round(counters.goodIntercepts / counters.total * 100) : 0;
  el.innerHTML = `
    <div class="stat-card">
      <div class="stat-num">${counters.total}</div>
      <div class="stat-label">累计测试场景</div>
    </div>
    <div class="stat-card stat-bad">
      <div class="stat-num">${badRate}%</div>
      <div class="stat-label">无 VSA 错误率</div>
    </div>
    <div class="stat-card stat-good">
      <div class="stat-num">${goodRate}%</div>
      <div class="stat-label">VSA 拦截保护率</div>
    </div>
  `;
}

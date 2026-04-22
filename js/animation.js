const STEPS = [
  { id: 'parse',     label: '1. 指令解析' },
  { id: 'dsl',       label: '2. DSL 规则生成' },
  { id: 'predicate', label: '3. 谓词级校验' },
  { id: 'critical',  label: '4. 规则级验证' },
  { id: 'result',    label: '5. 执行结果' }
];

export function initAnimationPanel() {
  const panel = document.getElementById('animation-panel');
  panel.innerHTML = STEPS.map(s => `
    <div class="anim-step" data-step="${s.id}">
      <div class="step-header">
        <div class="step-dot"></div>
        <div class="step-label">${s.label}</div>
        <div class="step-status">待开始</div>
      </div>
      <div class="step-body"></div>
    </div>
  `).join('');
}

export function resetPanel() {
  document.querySelectorAll('.anim-step').forEach(el => {
    el.classList.remove('active', 'passed', 'failed');
    el.querySelector('.step-body').innerHTML = '';
    el.querySelector('.step-status').textContent = '待开始';
  });
}

export async function runStep(stepId, { bodyHtml, passed }) {
  const el = document.querySelector(`.anim-step[data-step="${stepId}"]`);
  el.classList.add('active');
  el.querySelector('.step-status').textContent = '处理中...';
  await sleep(400);
  el.querySelector('.step-body').innerHTML = bodyHtml;
  await sleep(600);
  el.classList.remove('active');
  el.classList.add(passed ? 'passed' : 'failed');
  el.querySelector('.step-status').textContent = passed ? '通过' : '拦截';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

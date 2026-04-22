// 客户档案切换 + 记忆系统面板

import { personas } from './personas.js';

const STAR_FULL = '★';
const STAR_EMPTY = '☆';

function stars(n) {
  return STAR_FULL.repeat(n) + STAR_EMPTY.repeat(5 - n);
}

export function renderPersonaCards(containerEl, currentId, onChange) {
  containerEl.innerHTML = '';
  for (const p of personas) {
    const card = document.createElement('button');
    card.className = 'persona-card' + (p.id === currentId ? ' active' : '');
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="pc-emoji">${p.emoji}</div>
      <div class="pc-name">${p.name}</div>
      <div class="pc-title">${p.title}</div>
    `;
    card.addEventListener('click', () => {
      if (p.id !== currentId) onChange(p);
    });
    containerEl.appendChild(card);
  }
}

export function renderMemoryPanel(containerEl, persona) {
  const mem = persona.memory;
  const tagsHtml = mem.tags.map(t => `<span class="mem-tag">${t}</span>`).join('');
  const historyHtml = mem.history.map(h => `
    <div class="mem-history-item">
      <div class="mhi-head">
        <span class="mhi-stars">${stars(h.rating)}</span>
        <span class="mhi-rest">${h.restaurant}</span>
        <span class="mhi-type">· ${h.type}</span>
        <span class="mhi-date">${h.date}</span>
      </div>
      <div class="mhi-note">"${h.note}"</div>
    </div>
  `).join('');
  const blacklistHtml = mem.blacklist.length > 0
    ? mem.blacklist.map(b => `
        <div class="mem-blacklist-item">
          ⛔ ${b.restaurant} · <span class="mbi-reason">"${b.reason}"</span>
        </div>`).join('')
    : '<div class="mem-empty">无</div>';

  containerEl.innerHTML = `
    <div class="memory-head">
      <span class="mem-icon">🧠</span>
      <span class="mem-title">记忆系统</span>
      <span class="mem-subtitle">agent 已学习的用户画像</span>
    </div>
    <div class="mem-section">
      <div class="mem-label">偏好标签</div>
      <div class="mem-tags">${tagsHtml}</div>
    </div>
    <div class="mem-section">
      <div class="mem-label">历史订单 <span class="mem-count">(${mem.history.length})</span></div>
      <div class="mem-history">${historyHtml}</div>
    </div>
    <div class="mem-section">
      <div class="mem-label">黑名单</div>
      <div class="mem-blacklist">${blacklistHtml}</div>
    </div>
  `;
}

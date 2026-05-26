import { restaurants } from './data.js?v=20260526';
import { scenarios } from './scenarios.js';

export function renderRestaurantList() {
  const container = document.getElementById('restaurant-list');
  container.innerHTML = '';
  for (const r of restaurants) {
    const card = document.createElement('div');
    card.className = 'rest-card';
    card.dataset.id = r.id;
    const serviceText = r.services.length > 0
      ? r.services.map(s => ({ birthday: '生日', business: '商务', romantic: '浪漫', proposal: '求婚', anniversary: '纪念日', afternoon_tea: '下午茶' }[s] || s)).join(' ')
      : '';
    card.innerHTML = `
      <div class="rest-head">
        <div class="rest-name">${r.name}</div>
        <div class="rest-rating">\u2605 ${r.rating}</div>
      </div>
      <div class="rest-meta">
        <span>${r.cuisine}</span>
        <span>\u00b7 ${r.distance}km</span>
        <span>\u00b7 \u00a5${r.pricePerPerson}/人</span>
        <span>\u00b7 ${r.businessHours.open}-${r.businessHours.close}</span>
      </div>
      <div class="rest-rooms">
        ${r.rooms.map(room =>
          `<span class="room-tag ${room.type}">${room.type === 'private' ? '包间' : '大厅'} ${room.capacity}人</span>`
        ).join('')}
        ${serviceText ? `<span class="room-tag">${serviceText}</span>` : ''}
      </div>
    `;
    container.appendChild(card);
  }
}

export function highlightRestaurants(matchedIds, rejectedIds = []) {
  document.querySelectorAll('.rest-card').forEach(card => {
    card.classList.remove('matched', 'rejected');
    if (matchedIds.includes(card.dataset.id)) card.classList.add('matched');
    else if (rejectedIds.includes(card.dataset.id)) card.classList.add('rejected');
  });
}

export function renderInputArea(onSubmit) {
  const container = document.getElementById('input-area');
  container.innerHTML = `
    <div class="input-group">
      <textarea id="user-input" placeholder="用自然语言描述您的预约需求..."></textarea>
      <button id="submit-btn" class="primary-btn">提交验证</button>
    </div>
    <div class="scenarios-title">或选择预设场景：</div>
    <div class="scenario-grid"></div>
  `;

  const grid = container.querySelector('.scenario-grid');
  for (const s of scenarios) {
    const btn = document.createElement('button');
    btn.className = `scenario-btn color-${s.color}`;
    btn.innerHTML = `
      <span class="sc-icon">${s.icon}</span>
      <span class="sc-label">${s.label}</span>
      <span class="sc-input">${s.input}</span>
    `;
    btn.addEventListener('click', () => {
      document.getElementById('user-input').value = s.input;
      onSubmit(s.input, s);
    });
    grid.appendChild(btn);
  }

  container.querySelector('#submit-btn').addEventListener('click', () => {
    const text = document.getElementById('user-input').value.trim();
    if (text) onSubmit(text, null);
  });
}

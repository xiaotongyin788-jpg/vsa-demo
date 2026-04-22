// 预约成功后的手机短信卡片

function nowTimeString() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

function guessDateTime(rules) {
  const timeRule = rules.find(r => r.type === 'CONSTRAINT' && r.field === 'time');
  const partyRule = rules.find(r => r.type === 'CONSTRAINT' && r.field === 'party_size');
  const roomRule = rules.find(r => r.type === 'CONSTRAINT' && r.field === 'room_type');
  const d = new Date(); d.setDate(d.getDate() + 3);
  const dateStr = `${d.getMonth() + 1}月${d.getDate()}日`;
  const timeStr = timeRule ? timeRule.value : '19:00';
  const party = partyRule ? partyRule.value : 4;
  const wantPrivate = roomRule ? roomRule.value === 'private' : null;
  return { dateStr, timeStr, party, wantPrivate };
}

function randomCode() {
  return Math.floor(1000 + Math.random() * 9000);
}

export function renderSmsCard(containerEl, persona, recommendation, rules = []) {
  if (!recommendation) { containerEl.innerHTML = ''; return; }
  const r = recommendation.restaurant;
  const { dateStr, timeStr, party, wantPrivate } = guessDateTime(rules);
  const hasPrivate = r.rooms.some(rm => rm.type === 'private');
  const roomType = (wantPrivate === true && hasPrivate) ? '包间'
                 : (wantPrivate === false) ? '大厅'
                 : hasPrivate ? '包间' : '大厅';
  const deposit = r.deposit;

  containerEl.innerHTML = `
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-statusbar">
        <span>10:28</span>
        <span class="ph-signals">•••• 5G 📶 🔋</span>
      </div>
      <div class="phone-header">
        <span class="ph-back">‹</span>
        <span class="ph-title">短信</span>
        <span class="ph-dots">⋯</span>
      </div>
      <div class="phone-body">
        <div class="sms-sender">
          <div class="sms-sender-avatar">🏪</div>
          <div class="sms-sender-info">
            <div class="sms-sender-name">【${r.name}】订餐平台</div>
            <div class="sms-time">今天 ${nowTimeString()}</div>
          </div>
        </div>
        <div class="sms-bubble">
          <div>尊敬的${persona.salutation}：</div>
          <div>您已成功预订 <b>${dateStr} ${timeStr}</b>，<b>${roomType}</b> ${party} 人位。</div>
          <div>订金 <b>¥${deposit}</b> ${deposit > 0 ? '已收到' : '无需支付'}。到店请出示此短信。</div>
          <div style="margin-top:6px; color:#64748b; font-size:12px">
            退订回 T，咨询 400-${randomCode()}-${randomCode()}。
          </div>
        </div>
        <div class="sms-meta">
          <span>🧠 本条短信由 VSA 智能代理根据「${persona.name}」档案自动生成</span>
        </div>
      </div>
    </div>
  `;
}

export function clearSmsCard(containerEl) {
  containerEl.innerHTML = `
    <div class="sms-placeholder">
      📱 预约成功后，此处显示模拟确认短信
    </div>
  `;
}

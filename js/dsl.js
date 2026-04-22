const FUZZY_MAP = [
  { pattern: /好一点|评分高|高分|口碑好/, rule: { type: 'CONSTRAINT', field: 'rating', op: '>=', value: 4.0 } },
  { pattern: /离我近|近一点|附近/,         rule: { type: 'CONSTRAINT', field: 'distance', op: '<=', value: 1.0 } },
  { pattern: /人多一些|大桌/,              rule: { type: 'CONSTRAINT', field: 'party_size', op: '>=', value: 6 } },
  { pattern: /便宜|实惠|经济/,             rule: { type: 'CONSTRAINT', field: 'price_per_person', op: '<=', value: 80 } }
];

const SERVICE_MAP = {
  '生日': 'birthday',
  '求婚': 'proposal',
  '商务': 'business',
  '下午茶': 'afternoon_tea',
  '浪漫': 'romantic',
  '纪念日': 'anniversary',
  '派对': 'birthday'
};

export function parseNaturalLanguage(text) {
  const rules = [];

  // === 显式提取 ===

  // 评分
  const ratingMatch = text.match(/评分\s*(\d+\.?\d*)\s*(分)?\s*(以上|以下|以内)?/);
  if (ratingMatch) {
    rules.push({
      type: 'CONSTRAINT', field: 'rating',
      op: ratingMatch[3] === '以下' ? '<=' : '>=',
      value: parseFloat(ratingMatch[1])
    });
  }

  // 距离
  const distMatch = text.match(/距离\s*(\d+\.?\d*)\s*(公里|千米|km|米)\s*(内|以内)?/i);
  if (distMatch) {
    const n = parseFloat(distMatch[1]);
    const km = distMatch[2] === '米' ? n / 1000 : n;
    rules.push({ type: 'CONSTRAINT', field: 'distance', op: '<=', value: km });
  }

  // 人数
  const partyMatch = text.match(/(\d+)\s*人/);
  if (partyMatch) {
    rules.push({ type: 'CONSTRAINT', field: 'party_size', op: '==', value: parseInt(partyMatch[1]) });
  }

  // 时间
  const timeMatch = text.match(/(\d+)\s*[点时]/);
  if (timeMatch) {
    let h = parseInt(timeMatch[1]);
    if ((text.includes('晚') || text.includes('下午')) && h < 12) h += 12;
    if (h >= 6 && h <= 10 && (text.includes('晚') || text.includes('今晚'))) h += 12;
    rules.push({ type: 'CONSTRAINT', field: 'time', op: '==', value: `${String(h).padStart(2, '0')}:00` });
  }

  // 包间
  if (/包间|包房/.test(text)) {
    rules.push({ type: 'CONSTRAINT', field: 'room_type', op: '==', value: 'private' });
  }

  // 特殊服务
  for (const [keyword, service] of Object.entries(SERVICE_MAP)) {
    if (text.includes(keyword)) {
      rules.push({ type: 'CONSTRAINT', field: 'service', op: '==', value: service });
    }
  }

  // === 模糊映射 ===
  for (const { pattern, rule } of FUZZY_MAP) {
    if (pattern.test(text) && !rules.some(r => r.field === rule.field)) {
      rules.push({ ...rule });
    }
  }

  // "今晚" 兜底
  if (/今晚/.test(text) && !rules.some(r => r.field === 'time')) {
    rules.push({ type: 'CONSTRAINT', field: 'time', op: '==', value: '19:00' });
  }

  // "中午" 兜底
  if (/中午|午/.test(text) && !rules.some(r => r.field === 'time')) {
    rules.push({ type: 'CONSTRAINT', field: 'time', op: '==', value: '12:00' });
  }

  // === 自动生成 VERIFY ===
  if (rules.some(r => r.field === 'time')) {
    rules.push({ type: 'VERIFY', fn: 'table_available' });
    rules.push({ type: 'VERIFY', fn: 'within_business_hours' });
  }

  // === CRITICAL ===
  if (/定金|付款|支付|付/.test(text)) {
    const amountMatch = text.match(/(\d+)\s*(元|块|定金)/);
    rules.push({
      type: 'CRITICAL', fn: 'confirm_before_payment',
      amount: amountMatch ? parseInt(amountMatch[1]) : null
    });
  }

  if (/预订|预约|订/.test(text)) {
    rules.push({ type: 'CRITICAL', fn: 'all_constraints_satisfied' });
  }

  return rules;
}

export function formatDSL(rules) {
  return rules.map(r => {
    if (r.type === 'CONSTRAINT') return `CONSTRAINT ${r.field} ${r.op} ${JSON.stringify(r.value)}`;
    if (r.type === 'VERIFY') return `VERIFY ${r.fn}()`;
    if (r.type === 'CRITICAL') return `CRITICAL ${r.fn}()`;
    return '';
  }).join('\n');
}

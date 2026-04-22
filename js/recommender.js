// 6 维推荐评分：口味 / 价格 / 距离 / 评分 / 服务 / 记忆

export const DIMENSIONS = [
  { key: 'taste', label: '口味' },
  { key: 'price', label: '价格' },
  { key: 'distance', label: '距离' },
  { key: 'rating', label: '评分' },
  { key: 'service', label: '服务' },
  { key: 'memory', label: '记忆' },
];

// 相近菜系族
const CUISINE_GROUPS = [
  ['粤菜', '湘菜'],            // 中餐族
  ['西餐', '日料'],            // 精致西餐族
  ['火锅'],                    // 火锅族独立
  ['咖啡简餐'],                // 轻食族独立
];

function cuisineFamily(c) {
  return CUISINE_GROUPS.find(g => g.includes(c)) || [];
}

function clamp(x, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, x));
}

// ---- 维度 1：口味匹配 ----
function scoreCuisineMatch(persona, r) {
  if (persona.preferredCuisine.includes(r.cuisine)) return 100;
  const fam = cuisineFamily(r.cuisine);
  if (persona.preferredCuisine.some(c => fam.includes(c))) return 70;
  return 30;
}

// ---- 维度 2：价格契合 ----
function scorePriceMatch(persona, r) {
  const [lo, hi] = persona.budgetRange;
  const p = r.pricePerPerson;
  if (p >= lo && p <= hi) return 100;
  const center = (lo + hi) / 2;
  const halfRange = (hi - lo) / 2;
  const deviation = Math.abs(p - center) - halfRange;   // 超出边界多远
  const ratio = deviation / halfRange;
  if (ratio <= 0.2) return 70;
  return clamp(100 - 60 * ratio, 0, 100);
}

// ---- 维度 3：距离便利 ----
function scoreDistance(persona, r) {
  const max = persona.maxDistance;
  const d = r.distance;
  if (d <= max * 0.5) return 100;
  if (d <= max) return 70;
  const overRatio = d / max - 1;
  return clamp(100 - 40 * (1 + overRatio), 0, 100);     // 严重超标时快速衰减
}

// ---- 维度 4：评分信誉 ----
function scoreRating(r) {
  return clamp(r.rating * 20, 0, 100);
}

// ---- 维度 5：服务契合 ----
function scoreServiceMatch(persona, r) {
  if (persona.needs.length === 0) return 60;            // 无特殊需求，中性
  const hits = persona.needs.filter(n => r.services.includes(n)).length;
  return clamp(hits * 40, 0, 100);
}

// ---- 维度 6：记忆加成 ----
function scoreMemory(persona, r) {
  const bl = persona.memory.blacklist.find(b => b.restaurant === r.name);
  if (bl) return 10;
  const hit = persona.memory.history.find(h => h.restaurant === r.name);
  if (hit) return 100;
  const fam = cuisineFamily(r.cuisine);
  const sameFamily = persona.preferredCuisine.some(c => fam.includes(c));
  return sameFamily ? 65 : 50;
}

// ---- 主入口 ----
export function scoreRestaurant(persona, restaurant) {
  return {
    taste: scoreCuisineMatch(persona, restaurant),
    price: scorePriceMatch(persona, restaurant),
    distance: scoreDistance(persona, restaurant),
    rating: scoreRating(restaurant),
    service: scoreServiceMatch(persona, restaurant),
    memory: scoreMemory(persona, restaurant),
  };
}

export function overallScore(scores) {
  const vals = DIMENSIONS.map(d => scores[d.key]);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function recommendTopN(persona, restaurants, n = 3) {
  return restaurants
    .map(r => {
      const scores = scoreRestaurant(persona, r);
      return { restaurant: r, scores, overall: overallScore(scores) };
    })
    .sort((a, b) => b.overall - a.overall)
    .slice(0, n);
}

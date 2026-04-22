// 不是 node --test 的 test，而是一个快速 smoke 脚本
// 手动跑：node tests/smoke_persona.mjs
import { personas } from '../js/personas.js';
import { restaurants } from '../js/data.js';
import { recommendTopN } from '../js/recommender.js';

for (const p of personas) {
  console.log(`\n=== ${p.emoji} ${p.name} (${p.title}) ===`);
  const recs = recommendTopN(p, restaurants, 3);
  for (let i = 0; i < recs.length; i++) {
    const { restaurant: r, scores, overall } = recs[i];
    const rank = ['🥇', '🥈', '🥉'][i];
    console.log(`${rank} ${r.name.padEnd(8)} 综合=${overall.toFixed(1)}  口味=${scores.taste} 价格=${scores.price} 距离=${scores.distance} 评分=${scores.rating.toFixed(0)} 服务=${scores.service} 记忆=${scores.memory}`);
  }
}

// SVG 六边形雷达图 · Top-3 餐厅叠加对比

import { DIMENSIONS } from './recommender.js';

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 110;
const LABEL_RADIUS = 140;

// 从 12 点方向（顶部）开始，顺时针 6 个角
function axisPoint(i, r) {
  const angle = -Math.PI / 2 + i * (Math.PI * 2 / 6);
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

const SERIES_COLORS = [
  { id: 's0', fill: 'rgba(37, 99, 235, 0.35)',  stroke: '#2563eb', dash: '' },
  { id: 's1', fill: 'rgba(16, 185, 129, 0.25)', stroke: '#10b981', dash: '6 4' },
  { id: 's2', fill: 'rgba(245, 158, 11, 0.20)', stroke: '#f59e0b', dash: '2 3' },
];

function polygonPoints(scores) {
  return DIMENSIONS.map((d, i) => {
    const r = (scores[d.key] / 100) * RADIUS;
    const [x, y] = axisPoint(i, r);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function gridPolygon(ratio) {
  return DIMENSIONS.map((_, i) => {
    const [x, y] = axisPoint(i, RADIUS * ratio);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export function renderHexagon(containerEl, recommendations) {
  if (!recommendations || recommendations.length === 0) {
    containerEl.innerHTML = `
      <div class="hex-head">📊 六边形推荐评分</div>
      <div class="hex-empty">切换客户档案或提交预约后，此处显示 Top-3 推荐</div>
    `;
    return;
  }

  // 背景网格（4 层）
  const gridHtml = [1.0, 0.75, 0.5, 0.25].map(r =>
    `<polygon class="hex-grid" points="${gridPolygon(r)}" />`
  ).join('');

  // 坐标轴（6 条中心射线）
  const axesHtml = DIMENSIONS.map((_, i) => {
    const [x, y] = axisPoint(i, RADIUS);
    return `<line class="hex-axis" x1="${CENTER}" y1="${CENTER}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" />`;
  }).join('');

  // 轴标签
  const labelsHtml = DIMENSIONS.map((d, i) => {
    const [x, y] = axisPoint(i, LABEL_RADIUS);
    return `<text class="hex-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${d.label}</text>`;
  }).join('');

  // 数据多边形
  const seriesHtml = recommendations.slice(0, 3).map((rec, idx) => {
    const color = SERIES_COLORS[idx];
    return `
      <polygon class="hex-series ${color.id}"
        points="${polygonPoints(rec.scores)}"
        fill="${color.fill}" stroke="${color.stroke}" stroke-width="2"
        stroke-dasharray="${color.dash}" />
    `;
  }).join('');

  // 图例
  const legendHtml = recommendations.slice(0, 3).map((rec, idx) => {
    const color = SERIES_COLORS[idx];
    const rank = ['🥇', '🥈', '🥉'][idx];
    return `
      <div class="hex-legend-item">
        <span class="hex-dot" style="background:${color.stroke}"></span>
        <span class="hex-rank">${rank}</span>
        <span class="hex-rest-name">${rec.restaurant.name}</span>
        <span class="hex-overall">综合 ${rec.overall.toFixed(0)}</span>
      </div>
    `;
  }).join('');

  containerEl.innerHTML = `
    <div class="hex-head">📊 六边形推荐评分 · Top-${recommendations.length}</div>
    <div class="hex-body">
      <svg viewBox="0 0 ${SIZE} ${SIZE}" width="100%" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
        ${gridHtml}
        ${axesHtml}
        ${seriesHtml}
        ${labelsHtml}
      </svg>
      <div class="hex-legend">${legendHtml}</div>
    </div>
  `;
}

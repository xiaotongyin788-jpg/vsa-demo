export function generateFeedback(rules, restaurant, failedChecks, allRestaurants = []) {
  const suggestions = [];
  const reasons = failedChecks.map(c => c.reason);

  for (const failed of failedChecks) {
    if (failed.field === 'table_available') {
      const roomType = rules.find(r => r.field === 'room_type')?.value || 'hall';
      const party = rules.find(r => r.field === 'party_size')?.value || 1;
      const room = restaurant.rooms.find(r => r.type === roomType && r.capacity >= party);
      if (room && room.availableSlots.length > 0) {
        suggestions.push({
          type: 'alternative_time',
          message: `该餐厅该时段已满，可选时段：${room.availableSlots.slice(0, 3).join(' / ')}`
        });
      }
      // 推荐其他餐厅
      const others = allRestaurants.filter(r => r.id !== restaurant.id);
      const time = rules.find(r => r.field === 'time')?.value;
      if (time) {
        const available = others.filter(r =>
          r.rooms.some(room => room.type === roomType && room.capacity >= party && room.availableSlots.includes(time))
        );
        if (available.length > 0) {
          suggestions.push({
            type: 'alternative_restaurant',
            message: `附近满足条件的餐厅：${available.slice(0, 2).map(r => r.name).join('、')}`
          });
        }
      }
    } else if (failed.field === 'within_business_hours') {
      suggestions.push({
        type: 'adjust_time',
        message: `该餐厅营业时间为 ${restaurant.businessHours.open}-${restaurant.businessHours.close}，请调整时间`
      });
    } else if (['rating', 'distance', 'price_per_person', 'service'].includes(failed.field)) {
      const candidates = allRestaurants.filter(r => r.id !== restaurant.id);
      const matching = candidates.filter(r => {
        return rules.filter(rule => rule.type === 'CONSTRAINT').every(rule => {
          if (rule.field === 'rating') return r.rating >= rule.value;
          if (rule.field === 'distance') return r.distance <= rule.value;
          if (rule.field === 'price_per_person') return r.pricePerPerson <= rule.value;
          if (rule.field === 'room_type') return r.rooms.some(room => room.type === rule.value);
          if (rule.field === 'service') return r.services.includes(rule.value);
          return true;
        });
      });
      if (matching.length > 0) {
        suggestions.push({
          type: 'alternative_restaurant',
          message: `推荐满足条件的餐厅：${matching.slice(0, 2).map(r => r.name).join('、')}`
        });
      } else {
        suggestions.push({
          type: 'relax_constraint',
          message: '没有完全满足条件的餐厅，建议适当放宽条件'
        });
      }
    }
  }

  // 去重
  const seen = new Set();
  const unique = suggestions.filter(s => {
    const key = s.type + s.message;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { reasons, suggestions: unique };
}

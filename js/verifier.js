const FIELD_ACCESS = {
  rating: r => r.rating,
  distance: r => r.distance,
  price_per_person: r => r.pricePerPerson,
  room_type: r => r.rooms.map(x => x.type),
  service: r => r.services
};

const FIELD_LABEL = {
  rating: '评分', distance: '距离(km)', price_per_person: '人均(元)',
  room_type: '桌位类型', service: '特殊服务', party_size: '人数',
  time: '时间', table_available: '桌位可用性', within_business_hours: '营业时间'
};

const OPS = {
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '==': (a, b) => Array.isArray(a) ? a.includes(b) : a === b,
  '>':  (a, b) => a > b,
  '<':  (a, b) => a < b
};

function getConstraint(rules, field) {
  return rules.find(r => r.type === 'CONSTRAINT' && r.field === field);
}

function checkTableAvailable(rules, restaurant) {
  const time = getConstraint(rules, 'time')?.value;
  const party = getConstraint(rules, 'party_size')?.value || 2;
  const roomType = getConstraint(rules, 'room_type')?.value || 'hall';

  if (!time) return { passed: false, reason: '缺少时间信息' };

  const candidate = restaurant.rooms.find(r => r.type === roomType && r.capacity >= party);
  if (!candidate) {
    const typeName = roomType === 'private' ? '包间' : '大厅';
    return { passed: false, reason: `无满足 ${party} 人的${typeName}` };
  }

  const available = candidate.availableSlots.includes(time);
  return {
    passed: available,
    reason: available
      ? `${time} ${roomType === 'private' ? '包间' : '桌位'}可用`
      : `${time} 时段已满，可选：${candidate.availableSlots.slice(0, 3).join(' / ')}`
  };
}

function checkBusinessHours(rules, restaurant) {
  const time = getConstraint(rules, 'time')?.value;
  if (!time) return { passed: true, reason: '' };
  const { open, close } = restaurant.businessHours;
  const inRange = time >= open && time <= close;
  return {
    passed: inRange,
    reason: inRange ? `在营业时间 ${open}-${close}` : `营业时间 ${open}-${close}，所选 ${time} 超出范围`
  };
}

const VERIFY_FNS = {
  table_available: checkTableAvailable,
  within_business_hours: checkBusinessHours
};

export function verifyPredicates(rules, restaurant) {
  const checks = [];

  // 处理 CONSTRAINT
  for (const rule of rules) {
    if (rule.type !== 'CONSTRAINT') continue;

    // party_size 和 time 由 VERIFY 处理
    if (rule.field === 'party_size' || rule.field === 'time') continue;

    const accessor = FIELD_ACCESS[rule.field];
    if (!accessor) continue;

    const actual = accessor(restaurant);
    if (actual === null || actual === undefined) continue;

    const passed = OPS[rule.op](actual, rule.value);
    const label = FIELD_LABEL[rule.field] || rule.field;
    const displayActual = Array.isArray(actual) ? actual.join(', ') : actual;

    checks.push({
      field: rule.field,
      label: `${label} ${rule.op} ${rule.value}`,
      actual: displayActual,
      passed,
      reason: passed ? '符合' : `实际值 ${displayActual}，不满足 ${rule.op} ${rule.value}`
    });
  }

  // 处理 VERIFY
  for (const rule of rules) {
    if (rule.type !== 'VERIFY') continue;
    const fn = VERIFY_FNS[rule.fn];
    if (!fn) continue;
    const { passed, reason } = fn(rules, restaurant);
    checks.push({
      field: rule.fn,
      label: FIELD_LABEL[rule.fn] || rule.fn,
      passed,
      reason
    });
  }

  return {
    passed: checks.every(c => c.passed),
    checks
  };
}

export function verifyCritical(rules, predicateResult) {
  const criticals = rules.filter(r => r.type === 'CRITICAL');
  const details = [];
  let passed = true;
  let requiresConfirmation = false;

  for (const rule of criticals) {
    if (rule.fn === 'all_constraints_satisfied') {
      const ok = predicateResult.passed;
      details.push({
        label: '所有约束条件满足',
        passed: ok,
        note: ok ? '' : '存在未满足的约束条件'
      });
      if (!ok) passed = false;
    } else if (rule.fn === 'confirm_before_payment') {
      requiresConfirmation = true;
      const amountNote = rule.amount ? `定金 ${rule.amount} 元` : '定金支付';
      details.push({
        label: `支付前二次确认 (${amountNote})`,
        passed: true,
        note: '需用户确认后才可执行'
      });
    }
  }

  return { passed, requiresConfirmation, details };
}

export const scenarios = [
  {
    id: 'normal',
    label: '正常预约',
    icon: '\u2713',
    color: 'green',
    input: '预订今晚7点4人桌，评分4.0以上',
    expected: 'pass'
  },
  {
    id: 'fuzzy',
    label: '模糊指令',
    icon: '?',
    color: 'blue',
    input: '找个好一点的，离我近的，今晚吃',
    expected: 'pass'
  },
  {
    id: 'no-match',
    label: '条件不满足',
    icon: '!',
    color: 'orange',
    input: '预订明天中午包间，要能办生日派对',
    expected: 'predicate-fail'
  },
  {
    id: 'slot-full',
    label: '桌位冲突',
    icon: '\u2717',
    color: 'red',
    input: '预订今晚6点8人包间',
    expected: 'predicate-fail'
  },
  {
    id: 'high-risk',
    label: '高风险支付',
    icon: '$',
    color: 'purple',
    input: '帮我付500定金预订今晚8点西餐厅包间',
    expected: 'critical-intercept'
  },
  {
    id: 'missing',
    label: '信息遗漏',
    icon: '...',
    color: 'gray',
    input: '随便订一个今晚的',
    expected: 'missing-info'
  }
];

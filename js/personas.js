// 4 预设客户档案 + 记忆系统数据

export const personas = [
  {
    id: 'grandma',
    emoji: '👵',
    name: '王奶奶',
    title: '83岁 · 独居 · 腿脚不便',
    salutation: '王奶奶',
    phone: '138****8812',
    preferredCuisine: ['粤菜', '咖啡简餐'],
    budgetRange: [50, 150],
    maxDistance: 0.5,
    needs: [],
    memory: {
      tags: ['清淡', '无障碍', '500m内', '上午', '中餐'],
      history: [
        { restaurant: '翠园中餐厅', type: '早茶', rating: 5, date: '2周前', note: '环境好，服务员会帮忙拿包' },
        { restaurant: '翠园中餐厅', type: '午餐', rating: 4, date: '1月前', note: '粥很合口' },
        { restaurant: '街角咖啡', type: '下午茶', rating: 5, date: '1周前', note: '离家近，坐一下午' },
      ],
      blacklist: [
        { restaurant: '湘味小馆', reason: '太辣了，吃不消' },
      ],
    },
  },
  {
    id: 'business',
    emoji: '💼',
    name: '张总',
    title: '30岁 · 商务接待 · 预算宽松',
    salutation: '张总',
    phone: '139****6633',
    preferredCuisine: ['日料', '西餐', '粤菜'],
    budgetRange: [250, 500],
    maxDistance: 3.0,
    needs: ['business'],
    memory: {
      tags: ['包间', '安静', '高客单', '客户接待'],
      history: [
        { restaurant: '蓝海西餐厅', type: '商务晚宴', rating: 5, date: '3天前', note: '客户很满意，摆台专业' },
        { restaurant: '和风日料', type: '商务午餐', rating: 5, date: '1周前', note: '包间私密性好' },
        { restaurant: '翠园中餐厅', type: '商务午餐', rating: 4, date: '2周前', note: '合适本地客户' },
      ],
      blacklist: [],
    },
  },
  {
    id: 'couple',
    emoji: '💑',
    name: '小李&小周',
    title: '25岁 · 情侣约会 · 求仪式感',
    salutation: '李女士',
    phone: '186****5520',
    preferredCuisine: ['西餐', '日料'],
    budgetRange: [150, 400],
    maxDistance: 3.0,
    needs: ['romantic', 'anniversary', 'proposal'],
    memory: {
      tags: ['浪漫', '夜晚', '窗景', '周末'],
      history: [
        { restaurant: '蓝海西餐厅', type: '纪念日晚餐', rating: 5, date: '1月前', note: '窗边位置景色好' },
        { restaurant: '蓝海西餐厅', type: '生日晚餐', rating: 5, date: '3月前', note: '服务员送了甜品' },
      ],
      blacklist: [
        { restaurant: '老城火锅', reason: '味道太重，约会不合适' },
      ],
    },
  },
  {
    id: 'family',
    emoji: '👨‍👩‍👧',
    name: '李先生一家',
    title: '4人 · 带老人孩子 · 日常聚餐',
    salutation: '李先生',
    phone: '137****2244',
    preferredCuisine: ['火锅', '粤菜', '湘菜'],
    budgetRange: [80, 200],
    maxDistance: 2.0,
    needs: ['birthday'],
    memory: {
      tags: ['大厅', '儿童餐具', '丰俭由人', '周末'],
      history: [
        { restaurant: '老城火锅', type: '家庭聚餐', rating: 5, date: '2周前', note: '有儿童锅底' },
        { restaurant: '老城火锅', type: '孩子生日', rating: 4, date: '2月前', note: '孩子喜欢' },
        { restaurant: '翠园中餐厅', type: '家宴', rating: 4, date: '1月前', note: '老人喜欢' },
      ],
      blacklist: [],
    },
  },
];

export function getPersonaById(id) {
  return personas.find(p => p.id === id) || personas[0];
}

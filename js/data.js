export const restaurants = [
  {
    id: 'cuiyuan',
    name: '翠园中餐厅',
    cuisine: '粤菜',
    rating: 4.8,
    distance: 0.5,
    pricePerPerson: 220,
    businessHours: { open: '11:00', close: '22:00' },
    rooms: [
      { type: 'hall', capacity: 100, availableSlots: ['12:00','13:00','18:00','19:00','20:00','21:00'] },
      { type: 'private', capacity: 8, availableSlots: ['13:00','20:00','21:00'] }
    ],
    services: ['birthday', 'business', 'romantic'],
    deposit: 200
  },
  {
    id: 'hefeng',
    name: '和风日料',
    cuisine: '日料',
    rating: 4.6,
    distance: 0.8,
    pricePerPerson: 280,
    businessHours: { open: '17:00', close: '23:00' },
    rooms: [
      { type: 'hall', capacity: 40, availableSlots: ['17:30','18:00','19:00','20:00','21:00'] },
      { type: 'private', capacity: 6, availableSlots: ['18:00','19:00','20:30'] }
    ],
    services: [],
    deposit: 300
  },
  {
    id: 'laocheng',
    name: '老城火锅',
    cuisine: '火锅',
    rating: 4.2,
    distance: 1.5,
    pricePerPerson: 130,
    businessHours: { open: '11:00', close: '23:30' },
    rooms: [
      { type: 'hall', capacity: 80, availableSlots: ['12:00','17:00','18:00','19:00','20:00','21:00'] },
      { type: 'private', capacity: 12, availableSlots: ['19:00','20:00','21:00'] }
    ],
    services: ['birthday', 'business'],
    deposit: 150
  },
  {
    id: 'xiangwei',
    name: '湘味小馆',
    cuisine: '湘菜',
    rating: 3.8,
    distance: 0.3,
    pricePerPerson: 70,
    businessHours: { open: '11:00', close: '21:30' },
    rooms: [
      { type: 'hall', capacity: 40, availableSlots: ['12:00','17:30','18:30','19:30'] }
    ],
    services: [],
    deposit: 0
  },
  {
    id: 'lanhai',
    name: '蓝海西餐厅',
    cuisine: '西餐',
    rating: 4.5,
    distance: 2.0,
    pricePerPerson: 350,
    businessHours: { open: '17:30', close: '23:00' },
    rooms: [
      { type: 'hall', capacity: 50, availableSlots: ['18:00','19:00','20:00','21:00'] },
      { type: 'private', capacity: 10, availableSlots: ['19:00','20:00'] }
    ],
    services: ['birthday', 'proposal', 'anniversary'],
    deposit: 500
  },
  {
    id: 'jiejiao',
    name: '街角咖啡',
    cuisine: '咖啡简餐',
    rating: 4.7,
    distance: 0.2,
    pricePerPerson: 60,
    businessHours: { open: '08:00', close: '22:00' },
    rooms: [
      { type: 'hall', capacity: 30, availableSlots: ['10:00','14:00','15:00','16:00','19:00','20:00'] }
    ],
    services: ['afternoon_tea'],
    deposit: 0
  }
];

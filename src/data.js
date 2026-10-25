// 演示数据
const DemoData = {
  familyMembers: [
    { id: 'm1', name: '李先生', avatar: '李', color: '#3b82f6', role: '管理员' },
    { id: 'm2', name: '王女士', avatar: '王', color: '#ec4899', role: '成员' },
    { id: 'm3', name: '小明', avatar: '明', color: '#f59e0b', role: '孩子' }
  ],

  todayChores: [
    { id: 'c1', name: '做早餐', icon: '🍳', duration: 30, assignee: 'm1', status: 'done', note: '煮了粥和煎蛋' },
    { id: 'c2', name: '送小明上学', icon: '🎒', duration: 15, assignee: 'm2', status: 'done', note: '' },
    { id: 'c3', name: '拖地', icon: '🧹', duration: 45, assignee: 'm2', status: 'in-progress', note: '客厅+卧室' },
    { id: 'c4', name: '买菜', icon: '🛒', duration: 40, assignee: 'm1', status: 'pending', note: '晚上下班后去' },
    { id: 'c5', name: '做晚饭', icon: '🍲', duration: 60, assignee: 'm2', status: 'pending', note: '' },
    { id: 'c6', name: '洗碗', icon: '🧽', duration: 20, assignee: 'm1', status: 'pending', note: '' },
    { id: 'c7', name: '辅导作业', icon: '📚', duration: 60, assignee: 'm3', status: 'pending', note: '数学作业' }
  ],

  taskLibrary: [
    { id: 't1', name: '做早餐', icon: '🍳', duration: 30, defaultAssignee: 'm1' },
    { id: 't2', name: '做午饭', icon: '🥘', duration: 45, defaultAssignee: 'm2' },
    { id: 't3', name: '做晚饭', icon: '🍲', duration: 60, defaultAssignee: 'm2' },
    { id: 't4', name: '洗碗', icon: '🧽', duration: 20, defaultAssignee: 'm1' },
    { id: 't5', name: '拖地', icon: '🧹', duration: 45, defaultAssignee: 'm2' },
    { id: 't6', name: '擦桌子', icon: '🧻', duration: 10, defaultAssignee: 'm3' },
    { id: 't7', name: '倒垃圾', icon: '🗑️', duration: 5, defaultAssignee: 'm3' },
    { id: 't8', name: '买菜', icon: '🛒', duration: 40, defaultAssignee: 'm1' },
    { id: 't9', name: '送小明上学', icon: '🎒', duration: 15, defaultAssignee: 'm2' },
    { id: 't10', name: '接小明放学', icon: '🏫', duration: 15, defaultAssignee: 'm1' },
    { id: 't11', name: '辅导作业', icon: '📚', duration: 60, defaultAssignee: 'm3' },
    { id: 't12', name: '洗衣服', icon: '🧺', duration: 30, defaultAssignee: 'm2' },
    { id: 't13', name: '晾衣服', icon: '👕', duration: 15, defaultAssignee: 'm1' },
    { id: 't14', name: '整理床铺', icon: '🛏️', duration: 10, defaultAssignee: 'm3' },
    { id: 't15', name: '浇花', icon: '🌱', duration: 10, defaultAssignee: 'm2' }
  ],

  assignmentRules: [
    { id: 'r1', type: 'rotate', name: '轮换分配', desc: '每周轮换，公平合理' },
    { id: 'r2', type: 'manual', name: '手动分配', desc: '自定义每项任务负责人' },
    { id: 'r3', type: 'capability', name: '能力匹配', desc: '根据擅长自动分配' }
  ],

  generateMonthlySchedule(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const schedule = {};
    const baseTasks = [
      { name: '做早餐', icon: '🍳', duration: 30 },
      { name: '做晚饭', icon: '🍲', duration: 60 },
      { name: '洗碗', icon: '🧽', duration: 20 },
      { name: '拖地', icon: '🧹', duration: 45 }
    ];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayKey = `${year}-${String(month).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
      const dayOfWeek = new Date(year, month - 1, i).getDay();
      const tasks = baseTasks.map((task, idx) => ({
        ...task,
        id: `s-${dayKey}-${idx}`,
        assignee: ['m1', 'm2', 'm1', 'm3'][idx % 4],
        status: (i < 15) ? (dayOfWeek === 0 ? 'pending' : 'done') : 'pending'
      }));
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        tasks.push({ id: `s-${dayKey}-school`, name: '送小明上学', icon: '🎒', duration: 15, assignee: 'm2', status: tasks[0].status });
      }
      if (dayOfWeek === 6) {
        tasks.push({ id: `s-${dayKey}-laundry`, name: '洗衣服', icon: '🧺', duration: 30, assignee: 'm2', status: 'pending' });
      }
      schedule[dayKey] = tasks;
    }
    return schedule;
  },

  foodInventory: [
    { id: 'f1', name: '鸡蛋', icon: '🥚', category: '蛋奶', quantity: 12, unit: '个', expiryDays: 15, status: 'normal' },
    { id: 'f2', name: '牛奶', icon: '🥛', category: '蛋奶', quantity: 2, unit: '盒', expiryDays: 3, status: 'warning' },
    { id: 'f3', name: '西红柿', icon: '🍅', category: '蔬菜', quantity: 4, unit: '个', expiryDays: 2, status: 'danger' },
    { id: 'f4', name: '土豆', icon: '🥔', category: '蔬菜', quantity: 6, unit: '个', expiryDays: 20, status: 'normal' },
    { id: 'f5', name: '苹果', icon: '🍎', category: '水果', quantity: 8, unit: '个', expiryDays: 10, status: 'normal' },
    { id: 'f6', name: '香蕉', icon: '🍌', category: '水果', quantity: 3, unit: '根', expiryDays: 1, status: 'danger' },
    { id: 'f7', name: '鸡胸肉', icon: '🍗', category: '肉类', quantity: 500, unit: 'g', expiryDays: 1, status: 'danger' },
    { id: 'f8', name: '大米', icon: '🍚', category: '主食', quantity: 10, unit: 'kg', expiryDays: 90, status: 'normal' },
    { id: 'f9', name: '面包', icon: '🍞', category: '主食', quantity: 1, unit: '袋', expiryDays: 2, status: 'warning' },
    { id: 'f10', name: '酱油', icon: '🧴', category: '调料', quantity: 1, unit: '瓶', expiryDays: 180, status: 'normal' },
    { id: 'f11', name: '青菜', icon: '🥬', category: '蔬菜', quantity: 1, unit: '把', expiryDays: 1, status: 'danger' },
    { id: 'f12', name: '酸奶', icon: '🥛', category: '蛋奶', quantity: 6, unit: '杯', expiryDays: 7, status: 'normal' }
  ],

  todos: [
    { id: 'todo1', title: '交电费', note: '本月电费约200元', dueDate: '2026-09-20', priority: 'high', assignee: 'm1', completed: false, repeat: 'monthly', createdAt: '2026-09-15' },
    { id: 'todo2', title: '小明家长会', note: '下午3点，学校礼堂', dueDate: '2026-09-22', priority: 'high', assignee: 'm2', completed: false, repeat: 'none', createdAt: '2026-09-10' },
    { id: 'todo3', title: '换水龙头', note: '厨房水龙头漏水，已买新的', dueDate: '2026-09-18', priority: 'medium', assignee: 'm1', completed: false, repeat: 'none', createdAt: '2026-09-12' },
    { id: 'todo4', title: '买洗衣液', note: '蓝月亮，薰衣草味', dueDate: '2026-09-19', priority: 'low', assignee: 'm2', completed: true, repeat: 'none', createdAt: '2026-09-14' },
    { id: 'todo5', title: '整理车库', note: '周末一起整理', dueDate: '2026-09-21', priority: 'medium', assignee: 'm3', completed: false, repeat: 'none', createdAt: '2026-09-08' }
  ],

  shoppingList: [
    { id: 's1', name: '牛奶', quantity: '2盒', category: '蛋奶', checked: false, addedBy: 'm1' },
    { id: 's2', name: '鸡蛋', quantity: '10个', category: '蛋奶', checked: false, addedBy: 'm2' },
    { id: 's3', name: '西红柿', quantity: '3斤', category: '蔬菜', checked: true, addedBy: 'm1' },
    { id: 's4', name: '苹果', quantity: '2斤', category: '水果', checked: false, addedBy: 'm2' },
    { id: 's5', name: '鸡胸肉', quantity: '500g', category: '肉类', checked: false, addedBy: 'm1' },
    { id: 's6', name: '洗洁精', quantity: '1瓶', category: '日用品', checked: false, addedBy: 'm2' },
    { id: 's7', name: '大米', quantity: '5kg', category: '主食', checked: false, addedBy: 'm1' }
  ],

  bills: [
    { id: 'b1', name: '电费', amount: 186.5, category: '水电', date: '2026-09-05', paid: true },
    { id: 'b2', name: '水费', amount: 45.2, category: '水电', date: '2026-09-05', paid: true },
    { id: 'b3', name: '网费', amount: 99, category: '通讯', date: '2026-09-01', paid: true },
    { id: 'b4', name: '物业费', amount: 350, category: '住房', date: '2026-09-15', paid: false },
    { id: 'b5', name: '燃气费', amount: 68, category: '水电', date: '2026-09-10', paid: true },
    { id: 'b6', name: '小明学费', amount: 1200, category: '教育', date: '2026-09-01', paid: true }
  ],

  monthlyBudget: 5000,

  frequentItems: [
    { name: '牛奶', quantity: '2盒', category: '蛋奶', icon: '🥛' },
    { name: '鸡蛋', quantity: '10个', category: '蛋奶', icon: '🥚' },
    { name: '苹果', quantity: '2斤', category: '水果', icon: '🍎' },
    { name: '面包', quantity: '1袋', category: '主食', icon: '🍞' },
    { name: '洗洁精', quantity: '1瓶', category: '日用品', icon: '🧴' }
  ],

  dailyExpenses: [
    { date: '09-10', amount: 86 },
    { date: '09-11', amount: 124 },
    { date: '09-12', amount: 65 },
    { date: '09-13', amount: 210 },
    { date: '09-14', amount: 95 },
    { date: '09-15', amount: 156 },
    { date: '09-16', amount: 78 }
  ]
};

// 工具函数
const Utils = {
  getMemberById(id) {
    return DemoData.familyMembers.find(m => m.id === id) || { name: '未知', avatar: '?', color: '#9ca3af' };
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}月${day}日`;
  },

  getStatusText(status) {
    const map = { 'pending': '待做', 'in-progress': '进行中', 'done': '已完成' };
    return map[status] || status;
  },

  getPriorityText(priority) {
    const map = { 'high': '高', 'medium': '中', 'low': '低' };
    return map[priority] || priority;
  },

  getCategoryIcon(category) {
    const map = {
      '蛋奶': '🥚', '蔬菜': '🥬', '水果': '🍎', '肉类': '🥩',
      '主食': '🍚', '调料': '🧂', '日用品': '🧴', '水电': '💡',
      '通讯': '📱', '住房': '🏠', '教育': '📚'
    };
    return map[category] || '📦';
  }
};

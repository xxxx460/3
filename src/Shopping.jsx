function ShoppingPage({ state, setState, showToast, currentUser }) {
  const { shoppingList, frequentItems, bills, monthlyBudget, familyMembers, dailyExpenses } = state;
  const [activeTab, setActiveTab] = useState('shopping');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemCat, setNewItemCat] = useState('其他');

  const categories = ['全部', '蛋奶', '蔬菜', '水果', '肉类', '主食', '调料', '日用品', '其他'];
  const [filterCat, setFilterCat] = useState('全部');

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      showToast('请输入物品名称');
      return;
    }
    const newItem = {
      id: 's' + Date.now(),
      name: newItemName.trim(),
      quantity: newItemQty || '1份',
      category: newItemCat,
      checked: false,
      addedBy: currentUser ? currentUser.memberId : 'm1'
    };
    setState(prev => ({
      ...prev,
      shoppingList: [...prev.shoppingList, newItem]
    }));
    setNewItemName('');
    setNewItemQty('');
    showToast('已添加到购物清单');
  };

  const handleQuickAdd = (item) => {
    const exists = shoppingList.find(s => s.name === item.name && !s.checked);
    if (exists) {
      showToast('购物清单里已有该物品');
      return;
    }
    const newItem = {
      id: 's' + Date.now(),
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      checked: false,
      addedBy: currentUser ? currentUser.memberId : 'm1'
    };
    setState(prev => ({
      ...prev,
      shoppingList: [...prev.shoppingList, newItem]
    }));
    showToast(`已添加「${item.name}」`);
  };

  const toggleCheck = (id) => {
    setState(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.map(s =>
        s.id === id ? { ...s, checked: !s.checked } : s
      )
    }));
  };

  const deleteItem = (id) => {
    setState(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.filter(s => s.id !== id)
    }));
  };

  const handleBuyAll = () => {
    const count = shoppingList.filter(s => !s.checked).length;
    if (count === 0) {
      showToast('清单已经空啦');
      return;
    }
    if (!confirm(`确认购买 ${count} 件物品？已勾选的会自动清除。`)) return;
    setState(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.filter(s => !s.checked)
    }));
    showToast(`已购买 ${count} 件物品`);
  };

  const filteredList = filterCat === '全部'
    ? shoppingList
    : shoppingList.filter(s => s.category === filterCat);

  const unchecked = shoppingList.filter(s => !s.checked).length;
  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const budgetPercent = Math.round((totalBills / monthlyBudget) * 100);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">买菜 & 记账</div>
          <div className="page-subtitle">购物清单 · 账单管理 · 预算追踪</div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="view-tabs">
        <div className={`view-tab ${activeTab === 'shopping' ? 'active' : ''}`} onClick={() => setActiveTab('shopping')}>
          🛒 购物清单
        </div>
        <div className={`view-tab ${activeTab === 'bills' ? 'active' : ''}`} onClick={() => setActiveTab('bills')}>
          💡 账单管理
        </div>
        <div className={`view-tab ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>
          📊 预算概览
        </div>
      </div>

      {activeTab === 'shopping' && (
        <div className="shopping-layout">
          {/* 左侧：清单 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">购物清单（{unchecked} 件待买）</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setFilterCat('全部')}>
                  {filterCat === '全部' ? '全部' : '筛选'}
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleBuyAll}>
                  一键购买
                </button>
              </div>
            </div>
            <div className="card-body">
              {/* 快速添加 */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  className="form-input"
                  placeholder="添加物品..."
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                  style={{ flex: 1 }}
                />
                <input
                  className="form-input"
                  placeholder="数量"
                  value={newItemQty}
                  onChange={e => setNewItemQty(e.target.value)}
                  style={{ width: '100px' }}
                />
                <button className="btn btn-primary" onClick={handleAddItem}>添加</button>
              </div>

              {/* 分类筛选 */}
              <div className="category-chips">
                {categories.map(cat => (
                  <div
                    key={cat}
                    className={`category-chip ${filterCat === cat ? 'active' : ''}`}
                    onClick={() => setFilterCat(cat)}
                  >
                    {cat}
                  </div>
                ))}
              </div>

              {/* 购物列表 */}
              <div className="shopping-list">
                {filteredList.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
                    <div style={{ color: 'var(--gray-500)' }}>购物清单是空的</div>
                  </div>
                ) : (
                  filteredList.map(item => {
                    const addedBy = Utils.getMemberById(item.addedBy);
                    return (
                      <div key={item.id} className={`shopping-item ${item.checked ? 'checked' : ''}`}>
                        <div
                          className={`shopping-checkbox ${item.checked ? 'checked' : ''}`}
                          onClick={() => toggleCheck(item.id)}
                        >
                          {item.checked && '✓'}
                        </div>
                        <div className="shopping-item-info">
                          <div className="shopping-item-name">{item.name}</div>
                          <div className="shopping-item-meta">
                            <span className="shopping-item-qty">{item.quantity}</span>
                            <span className="shopping-item-cat">{item.category}</span>
                            <span className="shopping-item-addedby" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span className="member-mini-avatar" style={{ background: addedBy.color, width: '16px', height: '16px', fontSize: '9px' }}>
                                {addedBy.avatar}
                              </span>
                              {addedBy.name}添加
                            </span>
                          </div>
                        </div>
                        <button className="btn-icon btn-delete" onClick={() => deleteItem(item.id)}>×</button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 右侧：常购物品 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">常购物品</div>
            </div>
            <div className="card-body">
              <div className="frequent-items">
                {frequentItems.map((item, i) => (
                  <div key={i} className="frequent-item" onClick={() => handleQuickAdd(item)}>
                    <div className="frequent-icon">{item.icon}</div>
                    <div className="frequent-name">{item.name}</div>
                    <div className="frequent-qty">{item.quantity}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '20px', padding: '12px', background: 'var(--brand-50)', borderRadius: '8px', fontSize: '13px', color: 'var(--brand-700)' }}>
                💡 点击常购物品可快速加入清单
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">本月账单</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--brand-600)' }}>
              合计 ¥{totalBills.toFixed(2)}
            </div>
          </div>
          <div className="card-body">
            <div className="bill-list">
              {bills.map(bill => (
                <div key={bill.id} className="bill-item">
                  <div className="bill-icon-large" style={{ background: `${Utils.getCategoryIcon(bill.category)}` }}>
                    {Utils.getCategoryIcon(bill.category)}
                  </div>
                  <div className="bill-info">
                    <div className="bill-name">{bill.name}</div>
                    <div className="bill-date">{bill.date} · {bill.category}</div>
                  </div>
                  <div className="bill-right">
                    <div className={`bill-amount ${bill.paid ? '' : 'unpaid'}`}>¥{bill.amount.toFixed(2)}</div>
                    <div className={`bill-status ${bill.paid ? 'paid' : 'unpaid'}`}>
                      {bill.paid ? '已支付' : '待支付'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="shopping-layout">
          <div className="card">
            <div className="card-header">
              <div className="card-title">本月预算</div>
            </div>
            <div className="card-body">
              <div className="budget-overview">
                <div className="budget-circle">
                  <PieLegend percent={budgetPercent} label="已用" />
                </div>
                <div className="budget-details">
                  <div className="budget-detail-row">
                    <span>月度预算</span>
                    <span style={{ fontWeight: 600 }}>¥{monthlyBudget.toLocaleString()}</span>
                  </div>
                  <div className="budget-detail-row">
                    <span>已支出</span>
                    <span style={{ fontWeight: 600, color: 'var(--danger-600)' }}>¥{totalBills.toFixed(2)}</span>
                  </div>
                  <div className="budget-detail-row">
                    <span>剩余</span>
                    <span style={{ fontWeight: 600, color: 'var(--success-600)' }}>
                      ¥{(monthlyBudget - totalBills).toFixed(2)}
                    </span>
                  </div>
                  <div className="budget-detail-row">
                    <span>使用比例</span>
                    <span style={{ fontWeight: 600 }}>{budgetPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">近7天支出</div>
            </div>
            <div className="card-body">
              <div id="expense-chart" style={{ width: '100%', height: '280px' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

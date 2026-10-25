function Dashboard({ state, setState, onNavigate, showToast, currentUser }) {
  const { familyMembers, chores, todos, shoppingList, foodInventory, bills, monthlyBudget } = state;

  const completedChores = chores.filter(c => c.status === 'done').length;
  const totalChores = chores.length;
  const completionRate = totalChores > 0 ? Math.round((completedChores / totalChores) * 100) : 0;

  const pendingTodos = todos.filter(t => !t.completed).length;
  const expiringFood = foodInventory.filter(f => f.expiryDays <= 3).length;
  const pendingShopping = shoppingList.filter(s => !s.checked).length;

  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const budgetUsed = Math.min(monthlyBudget, totalBills);
  const budgetPercent = Math.round((budgetUsed / monthlyBudget) * 100);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">早安，{currentUser ? Utils.getMemberById(currentUser.memberId).name : ''}的家 ☀️</div>
          <div className="page-subtitle">今天是美好的一天，一起来完成家务吧</div>
        </div>
        <div className="member-avatars">
          {familyMembers.map(member => (
            <div key={member.id} className="member-avatar-item" title={member.name}>
              <div className="member-avatar-circle" style={{ background: member.color }}>
                {member.avatar}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 数据概览卡片 */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">🧹</div>
          <div className="stat-info">
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">今日家务完成率</div>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{pendingTodos}</div>
            <div className="stat-label">待办事项</div>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <div className="stat-value">{pendingShopping}</div>
            <div className="stat-label">待购物品</div>
          </div>
        </div>
        <div className="stat-card stat-pink">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{expiringFood}</div>
            <div className="stat-label">即将过期</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* 今日家务 */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">今日家务</div>
            <div className="card-action" onClick={() => onNavigate('chores')}>
              查看全部 →
            </div>
          </div>
          <div className="card-body">
            <div className="chore-list">
              {chores.slice(0, 5).map(chore => {
                const assignee = Utils.getMemberById(chore.assignee);
                return (
                  <div key={chore.id} className={`chore-item chore-${chore.status}`}>
                    <div className="chore-icon">{chore.icon}</div>
                    <div className="chore-info">
                      <div className="chore-name">{chore.name}</div>
                      <div className="chore-meta">{chore.duration}分钟 · {assignee.name}</div>
                    </div>
                    <div className={`chore-status-badge status-${chore.status}`}>
                      {Utils.getStatusText(chore.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 待办事项 */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">待办事项</div>
            <div className="card-action" onClick={() => onNavigate('todos')}>
              查看全部 →
            </div>
          </div>
          <div className="card-body">
            <div className="todo-list-mini">
              {todos.filter(t => !t.completed).slice(0, 4).map(todo => {
                const assignee = Utils.getMemberById(todo.assignee);
                return (
                  <div key={todo.id} className="todo-item-mini">
                    <div className={`todo-priority-dot priority-${todo.priority}`}></div>
                    <div className="todo-info">
                      <div className="todo-title-mini">{todo.title}</div>
                      <div className="todo-meta-mini">
                        {Utils.formatDate(todo.dueDate)} · {assignee.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 购物清单 */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">购物清单</div>
            <div className="card-action" onClick={() => onNavigate('shopping')}>
              查看全部 →
            </div>
          </div>
          <div className="card-body">
            <div className="shopping-quick">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  className="form-input"
                  placeholder="快速添加物品..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      const newItemName = e.target.value.trim();
                      const newItem = {
                        id: 's' + Date.now(),
                        name: newItemName,
                        quantity: '1份',
                        category: '其他',
                        checked: false,
                        addedBy: currentUser ? currentUser.memberId : 'm1'
                      };
                      setState(prev => ({
                        ...prev,
                        shoppingList: [...prev.shoppingList, newItem]
                      }));
                      e.target.value = '';
                      showToast('已添加到购物清单');
                    }
                  }}
                />
              </div>
              <div className="shopping-list-mini">
                {shoppingList.filter(s => !s.checked).slice(0, 5).map(item => {
                  const addedBy = Utils.getMemberById(item.addedBy);
                  return (
                    <div key={item.id} className="shopping-item-mini">
                      <span className="shopping-item-name">{item.name}</span>
                      <span className="shopping-item-qty">{item.quantity}</span>
                      <div className="member-mini-avatar" style={{ background: addedBy.color }} title={addedBy.name}>
                        {addedBy.avatar}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 月度预算 */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">本月预算</div>
            <div className="card-action" onClick={() => onNavigate('shopping')}>
              明细 →
            </div>
          </div>
          <div className="card-body">
            <div className="budget-info">
              <div className="budget-amount">
                <span className="budget-spent">¥{totalBills.toFixed(0)}</span>
                <span className="budget-total">/ ¥{monthlyBudget}</span>
              </div>
              <div className="budget-bar">
                <div
                  className={`budget-fill ${budgetPercent > 90 ? 'danger' : budgetPercent > 70 ? 'warning' : ''}`}
                  style={{ width: `${budgetPercent}%` }}
                ></div>
              </div>
              <div className="budget-labels">
                <span>已用 {budgetPercent}%</span>
                <span>剩余 ¥{(monthlyBudget - totalBills).toFixed(0)}</span>
              </div>
            </div>
            <div className="bill-list-mini">
              {bills.slice(0, 3).map(bill => (
                <div key={bill.id} className="bill-item-mini">
                  <span className="bill-icon">{Utils.getCategoryIcon(bill.category)}</span>
                  <span className="bill-name">{bill.name}</span>
                  <span className={`bill-amount ${bill.paid ? '' : 'unpaid'}`}>¥{bill.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

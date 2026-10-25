function TodosPage({ state, setState, showToast, openNewOnMount, currentUser }) {
  const { familyMembers, todos } = state;
  const [filter, setFilter] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [form, setForm] = useState({
    title: '',
    note: '',
    dueDate: '',
    priority: 'medium',
    assignee: currentUser ? currentUser.memberId : 'm1',
    repeat: 'none'
  });

  useEffect(() => {
    if (openNewOnMount) {
      setShowNewModal(true);
    }
  }, [openNewOnMount]);

  const openNew = () => {
    setEditingTodo(null);
    setForm({ title: '', note: '', dueDate: '', priority: 'medium', assignee: currentUser ? currentUser.memberId : 'm1', repeat: 'none' });
    setShowNewModal(true);
  };

  const editTodo = (todo) => {
    setEditingTodo(todo);
    setForm({
      title: todo.title,
      note: todo.note || '',
      dueDate: todo.dueDate || '',
      priority: todo.priority,
      assignee: todo.assignee,
      repeat: todo.repeat || 'none'
    });
    setShowNewModal(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      showToast('请输入待办标题');
      return;
    }

    if (editingTodo) {
      setState(prev => ({
        ...prev,
        todos: prev.todos.map(t => t.id === editingTodo.id ? { ...t, ...form, title: form.title.trim() } : t)
      }));
      showToast('待办已更新');
    } else {
      const newTodo = {
        id: 'todo' + Date.now(),
        ...form,
        title: form.title.trim(),
        completed: false,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setState(prev => ({
        ...prev,
        todos: [...prev.todos, newTodo]
      }));
      showToast('待办已创建');
    }
    setShowNewModal(false);
    setForm({ title: '', note: '', dueDate: '', priority: 'medium', assignee: currentUser ? currentUser.memberId : 'm1', repeat: 'none' });
  };

  const toggleTodo = (id) => {
    setState(prev => ({
      ...prev,
      todos: prev.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTodo = (id) => {
    if (!confirm('确定删除这个待办吗？')) return;
    setState(prev => ({
      ...prev,
      todos: prev.todos.filter(t => t.id !== id)
    }));
    showToast('已删除');
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'high') return t.priority === 'high' && !t.completed;
    return true;
  });

  const pendingCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  const filterOptions = [
    { id: 'all', label: '全部', count: todos.length },
    { id: 'pending', label: '待完成', count: pendingCount },
    { id: 'high', label: '高优先级', count: todos.filter(t => t.priority === 'high' && !t.completed).length },
    { id: 'completed', label: '已完成', count: completedCount }
  ];

  const repeatOptions = [
    { value: 'none', label: '不重复' },
    { value: 'daily', label: '每天' },
    { value: 'weekly', label: '每周' },
    { value: 'monthly', label: '每月' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">待办清单</div>
          <div className="page-subtitle">{pendingCount} 件待完成 · {completedCount} 件已完成</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={openNew}>➕ 新建待办</button>
        </div>
      </div>

      {/* 筛选 */}
      <div className="filter-tabs">
        {filterOptions.map(opt => (
          <div
            key={opt.id}
            className={`filter-tab ${filter === opt.id ? 'active' : ''}`}
            onClick={() => setFilter(opt.id)}
          >
            {opt.label}
            <span className="filter-count">{opt.count}</span>
          </div>
        ))}
      </div>

      {/* 待办列表 */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
              <div style={{ color: 'var(--gray-500)' }}>暂无待办事项</div>
            </div>
          ) : (
            <div className="todo-list">
              {filteredTodos.map(todo => {
                const assignee = Utils.getMemberById(todo.assignee);
                return (
                  <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                    <div
                      className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.completed && '✓'}
                    </div>
                    <div className="todo-content">
                      <div className="todo-title">{todo.title}</div>
                      {todo.note && <div className="todo-note">{todo.note}</div>}
                      <div className="todo-meta">
                        <span className={`priority-tag priority-${todo.priority}`}>
                          {Utils.getPriorityText(todo.priority)}优先级
                        </span>
                        {todo.dueDate && <span>📅 {Utils.formatDate(todo.dueDate)}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="member-mini-avatar" style={{ background: assignee.color }}>
                            {assignee.avatar}
                          </span>
                          {assignee.name}
                        </span>
                        {todo.repeat !== 'none' && (
                          <span>🔁 {repeatOptions.find(r => r.value === todo.repeat)?.label}</span>
                        )}
                      </div>
                    </div>
                    <div className="todo-actions">
                      <button className="btn-icon" onClick={() => editTodo(todo)}>编辑</button>
                      <button className="btn-icon btn-delete" onClick={() => deleteTodo(todo.id)}>删除</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 新建/编辑弹窗 */}
      {showNewModal && (
        <Modal
          title={editingTodo ? '编辑待办' : '新建待办'}
          onClose={() => setShowNewModal(false)}
          onSubmit={handleSubmit}
          submitText={editingTodo ? '保存修改' : '创建待办'}
        >
          <div className="form-group">
            <label className="form-label">标题 *</label>
            <input
              className="form-input"
              placeholder="要做什么？"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">备注</label>
            <textarea
              className="form-textarea"
              placeholder="详细描述..."
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">截止日期</label>
              <input
                type="date"
                className="form-input"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">优先级</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">指派给</label>
              <select
                className="form-select"
                value={form.assignee}
                onChange={e => setForm({ ...form, assignee: e.target.value })}
              >
                {familyMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">重复</label>
              <select
                className="form-select"
                value={form.repeat}
                onChange={e => setForm({ ...form, repeat: e.target.value })}
              >
                {repeatOptions.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ChoresPage({ state, setState, showToast, currentUser }) {
  const { familyMembers, chores, taskLibrary, assignmentRules, schedule } = state;
  const [viewMode, setViewMode] = useState('today');
  const [selectedDate, setSelectedDate] = useState('2026-09-16');
  const [selectedRule, setSelectedRule] = useState('rotate');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', icon: '🧹', duration: 15, defaultAssignee: 'm1' });

  const iconOptions = ['🍳', '🥘', '🍲', '🧹', '🧽', '🧻', '🗑️', '🛒', '🎒', '📚', '🧺', '👕', '🛏️', '🌱', '🧴'];

  const handleUpdateStatus = (choreId, newStatus) => {
    setState(prev => ({
      ...prev,
      chores: prev.chores.map(c =>
        c.id === choreId ? { ...c, status: newStatus } : c
      )
    }));
    showToast('状态已更新');
  };

  const handleAddToToday = (task) => {
    const newChore = {
      id: 'c' + Date.now(),
      name: task.name,
      icon: task.icon,
      duration: task.duration,
      assignee: currentUser ? currentUser.memberId : 'm1',
      status: 'pending',
      note: ''
    };
    setState(prev => ({
      ...prev,
      chores: [...prev.chores, newChore]
    }));
    showToast(`已添加「${task.name}」到今日任务`);
  };

  const handleCreateTask = () => {
    if (!newTask.name.trim()) {
      showToast('请输入任务名称');
      return;
    }
    const task = {
      id: 't' + Date.now(),
      ...newTask,
      name: newTask.name.trim()
    };
    setState(prev => ({
      ...prev,
      taskLibrary: [...prev.taskLibrary, task]
    }));
    setShowNewTaskModal(false);
    setNewTask({ name: '', icon: '🧹', duration: 15, defaultAssignee: 'm1' });
    showToast('任务已添加到任务库');
  };

  const handleGenerateToday = () => {
    if (!confirm('将从任务库生成今日推荐任务，现有未完成任务会保留。')) return;
    const baseTasks = taskLibrary.slice(0, 5);
    const newChores = baseTasks.map((task, i) => ({
      id: 'c' + Date.now() + i, name: task.name, icon: task.icon, duration: task.duration,
      assignee: currentUser ? currentUser.memberId : (i % 2 === 0 ? 'm1' : 'm2'), status: 'pending', note: ''
    }));
    setState(prev => ({
      ...prev,
      chores: [...prev.chores.filter(c => c.status === 'done'), ...newChores]
    }));
    showToast('已生成今日任务');
  };

  const todayDone = chores.filter(c => c.status === 'done').length;
  const todayTotal = chores.length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">家务排班</div>
          <div className="page-subtitle">合理分配，家庭更和谐</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handleGenerateToday}>📋 生成今日</button>
          <button className="btn btn-primary" onClick={() => setShowNewTaskModal(true)}>➕ 新建任务</button>
        </div>
      </div>

      {/* 视图切换 */}
      <div className="view-tabs">
        <div className={`view-tab ${viewMode === 'today' ? 'active' : ''}`} onClick={() => setViewMode('today')}>
          今日任务
        </div>
        <div className={`view-tab ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}>
          月历视图
        </div>
        <div className={`view-tab ${viewMode === 'rules' ? 'active' : ''}`} onClick={() => setViewMode('rules')}>
          轮换分配
        </div>
        <div className={`view-tab ${viewMode === 'library' ? 'active' : ''}`} onClick={() => setViewMode('library')}>
          任务库
        </div>
      </div>

      {/* 今日任务 */}
      {viewMode === 'today' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">今日家务（{todayDone}/{todayTotal}）</div>
          </div>
          <div className="card-body">
            <div className="chores-today-list">
              {chores.map(chore => {
                const assignee = Utils.getMemberById(chore.assignee);
                return (
                  <div key={chore.id} className={`chore-card chore-card-${chore.status}`}>
                    <div className="chore-card-icon">{chore.icon}</div>
                    <div className="chore-card-info">
                      <div className="chore-card-name">{chore.name}</div>
                      <div className="chore-card-meta">
                        <span>⏱ {chore.duration}分钟</span>
                        <span className="chore-card-assignee" style={{ color: assignee.color }}>
                          {assignee.avatar} {assignee.name}
                        </span>
                      </div>
                      {chore.note && <div className="chore-card-note">{chore.note}</div>}
                    </div>
                    <div className="chore-card-actions">
                      {chore.status === 'pending' && (
                        <>
                          <button className="btn-icon btn-start" onClick={() => handleUpdateStatus(chore.id, 'in-progress')}>开始</button>
                          <button className="btn-icon btn-done" onClick={() => handleUpdateStatus(chore.id, 'done')}>完成</button>
                        </>
                      )}
                      {chore.status === 'in-progress' && (
                        <button className="btn-icon btn-done" onClick={() => handleUpdateStatus(chore.id, 'done')}>完成</button>
                      )}
                      {chore.status === 'done' && (
                        <span className="done-check">✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 漏做提醒 */}
      {viewMode === 'today' && (
        <div className="card" style={{ marginTop: '16px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: 'none' }}>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>⏰</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#92400e' }}>昨日漏做提醒</div>
                <div style={{ fontSize: '13px', color: '#a16207' }}>有 1 项昨日任务未完成</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🧹</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>拖地</div>
                  <div className="chore-meta">昨日 · 责任人：王女士</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => showToast('已加入今日任务')}>
                  补做
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 月历视图 */}
      {viewMode === 'calendar' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">2026年9月</div>
          </div>
          <div className="card-body">
            <div className="calendar-grid">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                <div key={d} className="calendar-weekday">{d}</div>
              ))}
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const dayKey = `2026-09-${String(day).padStart(2, '0')}`;
                const dayTasks = schedule[dayKey] || [];
                const doneCount = dayTasks.filter(t => t.status === 'done').length;
                const totalCount = dayTasks.length;
                const isSelected = selectedDate === dayKey;
                const isToday = day === 16;
                const dayOfWeek = new Date(2026, 8, day).getDay();
                const hasAllDone = totalCount > 0 && doneCount === totalCount;

                return (
                  <div
                    key={day}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : ''}`}
                    onClick={() => setSelectedDate(dayKey)}
                  >
                    <div className="calendar-day-num">{day}</div>
                    {totalCount > 0 && (
                      <div className="calendar-day-tasks">
                        <div className="task-dot">
                          {hasAllDone ? '✓' : `${doneCount}/${totalCount}`}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 选中日期的任务详情 */}
            {selectedDate && (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--gray-100)' }}>
                <div className="form-label" style={{ marginBottom: '12px' }}>{selectedDate} 的家务</div>
                <div className="chore-list">
                  {(schedule[selectedDate] || []).map((task, idx) => {
                    const assignee = Utils.getMemberById(task.assignee);
                    return (
                      <div key={idx} className={`chore-item chore-${task.status}`}>
                        <div className="chore-icon">{task.icon}</div>
                        <div className="chore-info">
                          <div className="chore-name">{task.name}</div>
                          <div className="chore-meta">{task.duration}分钟 · {assignee.name}</div>
                        </div>
                        <div className={`chore-status-badge status-${task.status}`}>
                          {Utils.getStatusText(task.status)}
                        </div>
                      </div>
                    );
                  })}
                  {(schedule[selectedDate] || []).length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                      这一天没有安排家务
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 轮换分配 */}
      {viewMode === 'rules' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">分配规则设置</div>
          </div>
          <div className="rule-tabs">
            {assignmentRules.map(rule => (
              <div
                key={rule.id}
                className={`rule-tab ${selectedRule === rule.type ? 'active' : ''}`}
                onClick={() => {
                  setSelectedRule(rule.type);
                  showToast(`已切换为「${rule.name}」模式`);
                }}
              >
                <div className="rule-tab-name">{rule.name}</div>
                <div className="rule-tab-desc">{rule.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px' }}>
            <div className="form-label" style={{ marginBottom: '12px' }}>参与成员</div>
            <div className="member-chips">
              {familyMembers.map(member => (
                <div key={member.id} className="member-chip active">
                  <div className="member-chip-avatar" style={{ background: member.color }}>
                    {member.avatar}
                  </div>
                  {member.name}
                </div>
              ))}
            </div>
          </div>

          {selectedRule === 'manual' && (
            <div style={{ marginTop: '24px' }}>
              <div className="form-label" style={{ marginBottom: '12px' }}>手动分配预览</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {taskLibrary.slice(0, 4).map(task => (
                  <div key={task.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{task.icon}</span>
                      {task.name}
                    </span>
                    <div className="member-chips">
                      {familyMembers.slice(0, 2).map((m, i) => (
                        <div key={m.id} className={`member-chip ${i === 0 ? 'active' : ''}`}>
                          <div className="member-chip-avatar" style={{ background: m.color }}>{m.avatar}</div>
                          {m.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 任务库 */}
      {viewMode === 'library' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">任务库（{taskLibrary.length}项）</div>
          </div>
          <div className="card-body">
            <div className="task-library-grid">
              {taskLibrary.map(task => {
                const defaultAssignee = Utils.getMemberById(task.defaultAssignee);
                return (
                  <div key={task.id} className="task-library-card">
                    <div className="task-lib-icon">{task.icon}</div>
                    <div className="task-lib-name">{task.name}</div>
                    <div className="task-lib-meta">
                      {task.duration}分钟 · 默认 {defaultAssignee.name}
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => handleAddToToday(task)}>
                      加到今日
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 新建任务弹窗 */}
      {showNewTaskModal && (
        <Modal
          title="新建家务任务"
          onClose={() => setShowNewTaskModal(false)}
          onSubmit={handleCreateTask}
          submitText="添加到任务库"
        >
          <div className="form-group">
            <label className="form-label">任务名称</label>
            <input
              className="form-input"
              placeholder="例如：擦窗户"
              value={newTask.name}
              onChange={e => setNewTask({ ...newTask, name: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">图标</label>
              <select
                className="form-select"
                value={newTask.icon}
                onChange={e => setNewTask({ ...newTask, icon: e.target.value })}
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">时长（分钟）</label>
              <input
                type="number"
                className="form-input"
                value={newTask.duration}
                onChange={e => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 15 })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">默认负责人</label>
            <select
              className="form-select"
              value={newTask.defaultAssignee}
              onChange={e => setNewTask({ ...newTask, defaultAssignee: e.target.value })}
            >
              {familyMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}

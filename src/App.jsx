// localStorage 存储 key
const STORAGE_KEY = 'family-housekeeper-data-v2';
const OLD_STORAGE_KEY = 'family-housekeeper-data-v1';
const OLD_STORAGE_META_KEY = 'family-housekeeper-data-v1-meta';
const AUTH_KEY = 'family-housekeeper-auth-v1';
const SAVE_DEBOUNCE_MS = 800;

// 需要持久化的业务数据字段（家庭成员、任务库、排班规则等固定数据不持久化，以代码为准）
const PERSISTED_FIELDS = [
  'chores',
  'schedule',
  'foodInventory',
  'todos',
  'shoppingList',
  'bills',
  'monthlyBudget'
];

// 内置账号
const BUILTIN_USERS = [
  { account: '001', password: '000', memberId: 'm1' },
  { account: '002', password: '000', memberId: 'm2' },
  { account: '003', password: '000', memberId: 'm3' }
];

// 获取当前登录用户
function getCurrentUser() {
  try {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const user = BUILTIN_USERS.find(u => u.account === parsed.account);
      if (user) return user;
    }
  } catch (e) { /* ignore */ }
  return null;
}

// 保存登录状态
function saveAuth(user) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ account: user.account, memberId: user.memberId }));
    return true;
  } catch (e) { return false; }
}

// 清除登录状态
function clearAuth() {
  try { localStorage.removeItem(AUTH_KEY); return true; }
  catch (e) { return false; }
}

// 清理旧版本缓存
function clearOldStorage() {
  try {
    localStorage.removeItem(OLD_STORAGE_KEY);
    localStorage.removeItem(OLD_STORAGE_META_KEY);
  } catch (e) { /* ignore */ }
}

// 获取初始状态：从 localStorage 加载业务数据，固定数据以代码为准
function getInitialState() {
  // 启动时清除旧版本 key，避免污染
  clearOldStorage();

  // 以代码里的演示数据为基底（固定数据永远取最新代码值）
  const baseState = {
    familyMembers: DemoData.familyMembers,
    chores: DemoData.todayChores,
    taskLibrary: DemoData.taskLibrary,
    assignmentRules: DemoData.assignmentRules,
    schedule: DemoData.generateMonthlySchedule(2026, 9),
    foodInventory: DemoData.foodInventory,
    todos: DemoData.todos,
    shoppingList: DemoData.shoppingList,
    bills: DemoData.bills,
    monthlyBudget: DemoData.monthlyBudget,
    frequentItems: DemoData.frequentItems,
    dailyExpenses: DemoData.dailyExpenses,
    _loadedFromStorage: false
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 仅合并业务数据字段，固定字段（成员、任务库等）保持代码最新值
      if (parsed && parsed.chores && parsed.todos && parsed.shoppingList) {
        const merged = { ...baseState };
        PERSISTED_FIELDS.forEach(field => {
          if (parsed[field] !== undefined) {
            merged[field] = parsed[field];
          }
        });
        merged._loadedFromStorage = true;
        return merged;
      }
    }
  } catch (e) {
    console.warn('读取本地保存数据失败，使用演示数据', e);
  }
  return baseState;
}

// 保存到 localStorage（仅保存业务数据字段，固定数据不写入）
function saveToStorage(state) {
  try {
    const dataToSave = {};
    PERSISTED_FIELDS.forEach(field => {
      dataToSave[field] = state[field];
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return { success: true, time: new Date().toISOString() };
  } catch (e) {
    console.error('保存数据失败', e);
    return { success: false, error: e.message };
  }
}

// 重置为演示数据
function resetToDemoData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('清除本地数据失败', e);
    return false;
  }
}

// 主应用组件
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState({});
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  const quickMenuRef = useRef(null);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const saveTimerRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const [state, setState] = useState(getInitialState);

  const showToast = (message) => {
    setToast(message);
  };

  useEffect(() => {
    if (state._loadedFromStorage && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      try {
        const meta = localStorage.getItem(STORAGE_KEY + '-meta');
        if (meta) {
          const parsed = JSON.parse(meta);
          if (parsed.lastSaved) setLastSavedTime(parsed.lastSaved);
        }
      } catch (e) { /* ignore */ }
    }
  }, []);

  // 自动保存（防抖）
  useEffect(() => {
    if (state._loadedFromStorage && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      return;
    }

    setSaveStatus('saving');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const result = saveToStorage(state);
      if (result.success) {
        setSaveStatus('saved');
        setLastSavedTime(result.time);
        try {
          localStorage.setItem(STORAGE_KEY + '-meta', JSON.stringify({ lastSaved: result.time }));
        } catch (e) { /* ignore */ }
      } else {
        setSaveStatus('error');
        showToast('保存失败：' + result.error);
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [state]);

  // 页面关闭前强制保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveToStorage(state);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  // 重置数据
  const handleResetData = () => {
    if (!confirm('确定要重置所有数据吗？\n\n将恢复到初始演示数据，您的所有修改都会丢失。')) {
      return;
    }
    resetToDemoData();
    clearOldStorage();
    try {
      localStorage.removeItem(STORAGE_KEY + '-meta');
    } catch (e) { /* ignore */ }
    window.location.reload();
  };

  // 登录
  const handleLogin = (account, password) => {
    const user = BUILTIN_USERS.find(u => u.account === account);
    if (!user) {
      return { success: false, message: '账号不存在' };
    }
    if (user.password !== password) {
      return { success: false, message: '密码错误' };
    }
    saveAuth(user);
    setCurrentUser(user);
    setShowUserMenu(false);
    return { success: true, message: '登录成功' };
  };

  // 退出登录
  const handleLogout = () => {
    if (!confirm('确定要退出登录吗？')) return;
    clearAuth();
    setCurrentUser(null);
    setShowUserMenu(false);
    setShowQuickMenu(false);
    setShowNotifications(false);
    setCurrentPage('dashboard');
  };

  // 格式化保存时间
  const formatSavedTime = (isoTime) => {
    if (!isoTime) return '';
    const d = new Date(isoTime);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target)) {
        setShowQuickMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  const navItems = [
    { id: 'dashboard', label: '控制台' },
    { id: 'chores', label: '家务排班' },
    { id: 'shopping', label: '买菜记账' },
    { id: 'food', label: '食品管理' }
  ];

  // 快速记录操作
  const quickActions = [
    { id: 'chore', label: '记录家务', icon: '🧹', action: () => { setShowQuickMenu(false); handleNavigate('chores'); showToast('跳转到家务排班'); } },
    { id: 'todo', label: '新建待办', icon: '✅', action: () => { setShowQuickMenu(false); handleNavigate('todos', { openNew: true }); } },
    { id: 'shopping', label: '加购物', icon: '🛒', action: () => { setShowQuickMenu(false); handleNavigate('shopping'); } },
    { id: 'expense', label: '记一笔', icon: '💰', action: () => { setShowQuickMenu(false); handleNavigate('shopping'); showToast('记账功能开发中'); } }
  ];

  // 通知
  const notifications = [
    { id: 1, title: '小明的作业辅导', desc: '今天还未打卡完成', time: '刚刚', type: 'warning' },
    { id: 2, title: '西红柿快过期了', desc: '还有1天保质期', time: '30分钟前', type: 'danger' },
    { id: 3, title: '王女士添加了洗洁精', desc: '到购物清单', time: '2小时前', type: 'info' }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard state={state} setState={setState} onNavigate={handleNavigate} showToast={showToast} currentUser={currentUser} />;
      case 'chores':
        return <ChoresPage state={state} setState={setState} showToast={showToast} currentUser={currentUser} />;
      case 'todos':
        return <TodosPage state={state} setState={setState} showToast={showToast} openNewOnMount={pageParams.openNew} currentUser={currentUser} />;
      case 'shopping':
        return <ShoppingPage state={state} setState={setState} showToast={showToast} currentUser={currentUser} />;
      case 'food':
        return <FoodPage state={state} setState={setState} showToast={showToast} currentUser={currentUser} />;
      default:
        return <Dashboard state={state} setState={setState} onNavigate={handleNavigate} showToast={showToast} currentUser={currentUser} />;
    }
  };

  // 未登录时显示登录页
  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} showToast={showToast} />
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  return (
    <>
      {/* 顶部导航 */}
      <nav className="top-nav">
        <div className="nav-left">
          <div className="logo">H</div>
          <div className="logo-text">家庭管家</div>
        </div>

        <div className="nav-center">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNavigate(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="nav-right">
          {/* 保存状态指示器 */}
          <div className={`save-status-indicator save-status-${saveStatus}`} title={lastSavedTime ? `上次保存：${formatSavedTime(lastSavedTime)}` : '自动保存中'}>
            <span className="save-status-icon">
              {saveStatus === 'saving' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="save-spin">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
              {saveStatus === 'saved' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {saveStatus === 'error' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
            </span>
            <span className="save-status-text">
              {saveStatus === 'saving' && '保存中'}
              {saveStatus === 'saved' && '已保存'}
              {saveStatus === 'error' && '保存失败'}
            </span>
            {saveStatus === 'saved' && lastSavedTime && (
              <span className="save-status-time">· {formatSavedTime(lastSavedTime)}</span>
            )}
          </div>

          {/* 快速记录 */}
          <div ref={quickMenuRef} style={{ position: 'relative' }}>
            <button className="btn btn-primary" onClick={() => setShowQuickMenu(!showQuickMenu)}>
              ➕ 快速记录
            </button>
            {showQuickMenu && (
              <div className="dropdown" style={{ minWidth: '180px', right: 0 }}>
                {quickActions.map(action => (
                  <div key={action.id} className="dropdown-item" onClick={action.action}>
                    <span style={{ marginRight: '8px' }}>{action.icon}</span>
                    {action.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 通知 */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
              🔔
              <span className="notification-dot"></span>
            </div>
            {showNotifications && (
              <div className="dropdown" style={{ minWidth: '320px', right: 0 }}>
                <div style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>
                  通知（{notifications.length}）
                </div>
                {notifications.map(notif => (
                  <div key={notif.id} className="notification-item">
                    <div className={`notification-dot-icon notification-${notif.type}`}></div>
                    <div className="notification-content">
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-desc">{notif.desc}</div>
                      <div className="notification-time">{notif.time}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '8px 16px', borderTop: '1px solid var(--gray-100)', textAlign: 'center', color: 'var(--brand-600)', fontSize: '13px', cursor: 'pointer' }}>
                  查看全部
                </div>
              </div>
            )}
          </div>

          {/* 头像 + 用户菜单 */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <div className="avatar" onClick={() => setShowUserMenu(!showUserMenu)} style={{ background: Utils.getMemberById(currentUser.memberId).color }}>
              {Utils.getMemberById(currentUser.memberId).avatar}
            </div>
            {showUserMenu && (
              <div className="dropdown" style={{ minWidth: '200px', right: 0 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{Utils.getMemberById(currentUser.memberId).name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>李先生的家 · {Utils.getMemberById(currentUser.memberId).role || '成员'}</div>
                </div>
                <div className="dropdown-item" onClick={() => { setShowUserMenu(false); showToast('设置功能开发中'); }}>
                  ⚙️  设置
                </div>
                <div className="dropdown-divider"></div>
                <div
                  className="dropdown-item"
                  style={{ color: 'var(--danger-600)' }}
                  onClick={handleResetData}
                >
                  🔄  重置为演示数据
                </div>
                <div
                  className="dropdown-item"
                  style={{ color: 'var(--gray-600)' }}
                  onClick={handleLogout}
                >
                  🚪  退出登录
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}

// ========== 登录页面 ==========
function LoginPage({ onLogin, showToast }) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const accountInputRef = useRef(null);

  useEffect(() => {
    if (accountInputRef.current) {
      accountInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!account.trim()) {
      setError('请输入账号');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = onLogin(account.trim(), password);
      setLoading(false);
      if (!result.success) {
        setError(result.message);
      } else {
        showToast(`欢迎回来，${Utils.getMemberById(result.memberId || 'm1').name}！`);
      }
    }, 400);
  };

  const quickLogin = (acc) => {
    setAccount(acc);
    setPassword('000');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-area">
          <div className="login-logo">H</div>
          <div className="login-title">家庭管家</div>
          <div className="login-subtitle">让家庭协作更简单</div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">账号</label>
            <input
              ref={accountInputRef}
              className="form-input"
              placeholder="请输入账号"
              value={account}
              onChange={e => { setAccount(e.target.value); setError(''); }}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="请输入密码"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="login-quick-area">
          <div className="login-quick-title">快捷登录（演示账号）</div>
          <div className="login-quick-users">
            {BUILTIN_USERS.map(user => {
              const member = Utils.getMemberById(user.memberId);
              return (
                <div
                  key={user.account}
                  className="login-quick-user"
                  onClick={() => quickLogin(user.account)}
                >
                  <div className="login-quick-avatar" style={{ background: member.color }}>{member.avatar}</div>
                  <div className="login-quick-name">{member.name}</div>
                  <div className="login-quick-account">账号 {user.account}</div>
                </div>
              );
            })}
          </div>
          <div className="login-tip">默认密码均为 000</div>
        </div>
      </div>
    </div>
  );
}

// 渲染
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

function FoodPage({ state, setState, showToast }) {
  const { foodInventory } = state;
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('expiry');

  const categories = [...new Set(foodInventory.map(f => f.category))];

  const statusLabels = [
    { id: 'all', label: '全部' },
    { id: 'danger', label: '即将过期' },
    { id: 'warning', label: '保质期短' },
    { id: 'normal', label: '充足' }
  ];

  let filtered = [...foodInventory];
  if (filterStatus !== 'all') {
    filtered = filtered.filter(f => f.status === filterStatus);
  }
  if (sortBy === 'expiry') {
    filtered.sort((a, b) => a.expiryDays - b.expiryDays);
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'category') {
    filtered.sort((a, b) => a.category.localeCompare(b.category));
  }

  const dangerCount = foodInventory.filter(f => f.status === 'danger').length;
  const warningCount = foodInventory.filter(f => f.status === 'warning').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">食品管理</div>
          <div className="page-subtitle">
            共 {foodInventory.length} 种食材
            {dangerCount > 0 && <span style={{ color: 'var(--danger-600)', marginLeft: '8px' }}>· {dangerCount} 种即将过期 ⚠️</span>}
          </div>
        </div>
      </div>

      {/* 顶部预警 */}
      {dangerCount > 0 && (
        <div className="alert-box alert-danger">
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 600 }}>有 {dangerCount} 种食材即将过期</div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>建议尽快食用或添加到购物清单补货</div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setFilterStatus('danger')}>
            查看详情
          </button>
        </div>
      )}

      {/* 筛选排序 */}
      <div className="filter-bar">
        <div className="filter-tabs">
          {statusLabels.map(s => (
            <div
              key={s.id}
              className={`filter-tab ${filterStatus === s.id ? 'active' : ''}`}
              onClick={() => setFilterStatus(s.id)}
            >
              {s.label}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>排序：</span>
          <select className="form-select" style={{ width: '120px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="expiry">保质期</option>
            <option value="name">名称</option>
            <option value="category">分类</option>
          </select>
        </div>
      </div>

      {/* 食品网格 */}
      <div className="food-grid">
        {filtered.map(food => (
          <div key={food.id} className={`food-card food-${food.status}`}>
            <div className="food-icon">{food.icon}</div>
            <div className="food-name">{food.name}</div>
            <div className="food-category">{food.category}</div>
            <div className="food-quantity">{food.quantity}{food.unit}</div>
            <div className={`food-expiry expiry-${food.status}`}>
              {food.expiryDays <= 1 ? '今天到期' : `还剩 ${food.expiryDays} 天`}
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <button className="btn btn-outline btn-xs" onClick={() => showToast('已加入购物清单')}>+ 补货</button>
              <button className="btn btn-outline btn-xs" onClick={() => showToast('已消耗1份')}>-1</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥗</div>
          <div style={{ color: 'var(--gray-500)' }}>没有符合条件的食材</div>
        </div>
      )}
    </div>
  );
}

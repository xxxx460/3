// Modal 组件
function Modal({ title, children, onClose, onSubmit, submitText = '确定' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <div className="modal-close" onClick={onClose}>×</div>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={onSubmit}>{submitText}</button>
        </div>
      </div>
    </div>
  );
}

// Toast 组件
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className="toast">{message}</div>;
}

// 饼图 + 中心文字组件
function PieLegend({ percent, label }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent > 90 ? '#ef4444' : percent > 70 ? '#f59e0b' : '#2563eb';

  return (
    <div style={{ position: 'relative', width: '140px', height: '140px' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 700, color }}>{percent}%</div>
        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{label}</div>
      </div>
    </div>
  );
}

// 挂载到 window 供其他文件使用
Object.assign(window, {
  Modal,
  Toast,
  PieLegend
});

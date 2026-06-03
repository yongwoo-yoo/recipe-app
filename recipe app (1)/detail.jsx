// detail.jsx — recipe detail with ingredient checklist + per-step countdown timers

function StepTimer({ step, activeTimer, onStart, onPause, onResume, onReset }) {
  if (!step.timer) return null;
  const isActive = activeTimer && activeTimer.stepId === step.id;
  const { durationSeconds, label } = step.timer;

  if (!isActive) {
    return (
      <div className="timer-pill">
        <span className="timer-label"><Icon name="clock" size={15} stroke={2.2} /> {label || window.formatTime(durationSeconds)}</span>
        <button className="timer-start" onClick={(e) => { e.stopPropagation(); onStart(step.id, durationSeconds); }}>타이머 시작</button>
      </div>
    );
  }

  const { remaining, total, running } = activeTimer;
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const done = remaining <= 0;
  const cat = activeTimer.color || 'var(--accent-ink)';

  return (
    <div className="timer-active">
      <div className={'timer-time' + (done ? ' done' : '')}>{done ? '완료! ⏰' : window.formatTime(remaining)}</div>
      <div className="timer-track"><div className="timer-fill" style={{ width: pct + '%', background: done ? '#E2574C' : cat }} /></div>
      <div className="timer-controls">
        <button className="iconbtn bordered" onClick={(e) => { e.stopPropagation(); onReset(); }} title="리셋"><Icon name="refresh" size={18} /></button>
        {!done && (
          <button className="iconbtn bordered" onClick={(e) => { e.stopPropagation(); running ? onPause() : onResume(); }} title={running ? '일시정지' : '계속'}>
            <Icon name={running ? 'pause' : 'play'} size={18} />
          </button>
        )}
        <span style={{ marginLeft: 6, fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>{step.timer.label}</span>
      </div>
    </div>
  );
}

function DetailScreen({ recipe, onBack, onEdit, onDelete }) {
  const cat = window.getCategoryById(recipe.categoryId);
  const [checked, setChecked] = React.useState({});
  const [activeTimer, setActiveTimer] = React.useState(null);
  const intervalRef = React.useRef(null);

  // timer tick
  React.useEffect(() => {
    if (activeTimer && activeTimer.running && activeTimer.remaining > 0) {
      intervalRef.current = setInterval(() => {
        setActiveTimer((t) => {
          if (!t) return t;
          const remaining = t.remaining - 1;
          if (remaining <= 0) {
            try { navigator.vibrate && navigator.vibrate(300); } catch {}
            return { ...t, remaining: 0, running: false };
          }
          return { ...t, remaining };
        });
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [activeTimer && activeTimer.running, activeTimer && activeTimer.stepId]);

  const startTimer = (stepId, seconds) => setActiveTimer({ stepId, total: seconds, remaining: seconds, running: true, color: cat.color });
  const pause = () => setActiveTimer((t) => t && { ...t, running: false });
  const resume = () => setActiveTimer((t) => t && { ...t, running: true });
  const reset = () => setActiveTimer(null);

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="detail screen-enter">
      <div className="wrap">
        {/* nav row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14 }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}><Icon name="back" size={17} /> 목록</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => onEdit(recipe.id)}><Icon name="edit" size={16} /> 편집</button>
            <button className="iconbtn bordered" onClick={() => onDelete(recipe.id)} title="삭제"><Icon name="trash" size={17} /></button>
          </div>
        </div>

        {/* hero */}
        <div className="detail-hero">
          <div className="detail-hero-media">
            <FoodPlaceholder color={cat.color} label={recipe.title + ' 완성 사진'} />
            <div className="detail-hero-grad" />
            <div className="detail-hero-content">
              <span className="detail-hero-badge" style={{ background: cat.color }}>
                <span style={{ fontSize: 13 }}>{cat.emoji}</span> {cat.label}
              </span>
              <h1 className="detail-title">{recipe.title}</h1>
              {recipe.description && <p className="detail-sub">{recipe.description}</p>}
              <div className="detail-stats">
                {recipe.servings && <span className="detail-stat"><Icon name="users" size={16} stroke={2.2} /> {recipe.servings}</span>}
                <span className="detail-stat"><Icon name="list" size={16} stroke={2.2} /> {recipe.steps.length}단계</span>
                {window.timeLabel(recipe) && <span className="detail-stat"><Icon name="clock" size={16} stroke={2.2} /> {window.timeLabel(recipe)}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* body grid */}
        <div className="detail-grid">
          {/* ingredients */}
          <div className="panel ingredients-panel">
            <div className="panel-label">INGREDIENTS</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h2 className="panel-h">재료</h2>
              {recipe.ingredients.length > 0 && <span style={{ fontSize: 12.5, color: 'var(--ink-faint)', fontWeight: 600 }}>{checkedCount}/{recipe.ingredients.length}</span>}
            </div>
            {recipe.ingredients.map((ing) => {
              const on = !!checked[ing.id];
              return (
                <div className="ing-row" key={ing.id}>
                  <button className={'ing-check' + (on ? ' on' : '')} onClick={() => setChecked((c) => ({ ...c, [ing.id]: !c[ing.id] }))}>
                    {on && <Icon name="check" size={13} stroke={3} />}
                  </button>
                  <span className={'ing-name' + (on ? ' done' : '')}>{ing.name}</span>
                  <span className="ing-qty">{ing.quantity}</span>
                </div>
              );
            })}
            {recipe.ingredients.length === 0 && <p style={{ fontSize: 14, color: 'var(--ink-faint)', padding: '4px 0 16px' }}>등록된 재료가 없습니다.</p>}
          </div>

          {/* steps */}
          <div>
            <div className="panel-label" style={{ marginLeft: 2 }}>DIRECTIONS</div>
            <h2 className="panel-h" style={{ marginLeft: 2 }}>조리 단계</h2>
            <div className="steps">
              {recipe.steps.map((step, i) => (
                <div className="step-card" key={step.id}>
                  <div className="step-num">{i + 1}</div>
                  <div className="step-body">
                    <p className="step-text">{step.instruction}</p>
                    <StepTimer step={step} activeTimer={activeTimer} onStart={startTimer} onPause={pause} onResume={resume} onReset={reset} />
                  </div>
                </div>
              ))}
            </div>
            {recipe.notes && (
              <div className="notes-card">
                <div className="panel-label" style={{ color: '#C8862A', marginBottom: 6 }}>📝 NOTES</div>
                <p className="notes-text">{recipe.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DetailScreen, StepTimer });

// util.jsx — shared helpers

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// human total time across steps that have timers
function totalTimerSeconds(recipe) {
  return (recipe.steps || []).reduce((sum, s) => sum + (s.timer ? s.timer.durationSeconds : 0), 0);
}

function timeLabel(recipe) {
  const total = totalTimerSeconds(recipe);
  if (!total) return null;
  const m = Math.round(total / 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `약 ${h}시간 ${rem}분` : `약 ${h}시간`;
  }
  return `약 ${m}분`;
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// localStorage-backed state
function usePersistentState(key, initial) {
  const [val, setVal] = React.useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initial;
    } catch { return initial; }
  });
  React.useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

Object.assign(window, { formatTime, totalTimerSeconds, timeLabel, uid, usePersistentState });

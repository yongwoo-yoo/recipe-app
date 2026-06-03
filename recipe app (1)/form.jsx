// form.jsx — recipe add / edit form (also used to confirm AI-extracted recipes)

function RecipeForm({ initial, onSubmit, submitLabel = '저장' }) {
  const [data, setData] = React.useState(() => ({
    title: '', categoryId: 'korean', description: '', servings: '',
    ingredients: [{ id: window.uid(), name: '', quantity: '' }],
    steps: [{ id: window.uid(), instruction: '' }],
    notes: '',
    ...initial,
  }));

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const setIng = (id, k, v) => set('ingredients', data.ingredients.map((i) => i.id === id ? { ...i, [k]: v } : i));
  const addIng = () => set('ingredients', [...data.ingredients, { id: window.uid(), name: '', quantity: '' }]);
  const delIng = (id) => set('ingredients', data.ingredients.filter((i) => i.id !== id));

  const setStep = (id, v) => set('steps', data.steps.map((s) => s.id === id ? { ...s, instruction: v } : s));
  const setStepTimer = (id, mins) => set('steps', data.steps.map((s) => {
    if (s.id !== id) return s;
    const m = parseInt(mins, 10);
    if (!m || m <= 0) { const { timer, ...rest } = s; return rest; }
    return { ...s, timer: { durationSeconds: m * 60, label: `${m}분` } };
  }));
  const addStep = () => set('steps', [...data.steps, { id: window.uid(), instruction: '' }]);
  const delStep = (id) => set('steps', data.steps.filter((s) => s.id !== id));

  const canSave = data.title.trim().length > 0;

  const submit = () => {
    const clean = {
      ...data,
      title: data.title.trim(),
      ingredients: data.ingredients.filter((i) => i.name.trim()),
      steps: data.steps.filter((s) => s.instruction.trim()),
    };
    onSubmit(clean);
  };

  return (
    <div className="form-block">
      <div>
        <label className="field-label">레시피 이름</label>
        <input className="input" value={data.title} onChange={(e) => set('title', e.target.value)} placeholder="예: 돼지고기 김치찌개" autoFocus />
      </div>

      <div>
        <label className="field-label">카테고리</label>
        <div className="cat-picker">
          {window.CATEGORIES.map((c) => {
            const on = data.categoryId === c.id;
            return (
              <button key={c.id} type="button" className={'cat-opt' + (on ? ' on' : '')} onClick={() => set('categoryId', c.id)}
                style={on ? { background: c.color, borderColor: c.color } : null}>
                <span>{c.emoji}</span> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 14 }}>
        <div>
          <label className="field-label">한 줄 설명</label>
          <input className="input" value={data.description} onChange={(e) => set('description', e.target.value)} placeholder="간단한 소개" />
        </div>
        <div>
          <label className="field-label">분량</label>
          <input className="input" value={data.servings} onChange={(e) => set('servings', e.target.value)} placeholder="2인분" />
        </div>
      </div>

      <div>
        <label className="field-label">재료</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {data.ingredients.map((i) => (
            <div className="line-item" key={i.id}>
              <input className="input" style={{ flex: 2 }} value={i.name} onChange={(e) => setIng(i.id, 'name', e.target.value)} placeholder="재료명" />
              <input className="input" style={{ flex: 1, maxWidth: 130 }} value={i.quantity} onChange={(e) => setIng(i.id, 'quantity', e.target.value)} placeholder="양" />
              <button className="line-del" onClick={() => delIng(i.id)} title="삭제"><Icon name="x" size={17} /></button>
            </div>
          ))}
        </div>
        <button className="add-line" style={{ marginTop: 10 }} onClick={addIng}><Icon name="plus" size={15} /> 재료 추가</button>
      </div>

      <div>
        <label className="field-label">조리 단계</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {data.steps.map((s, idx) => (
            <div className="line-item" key={s.id} style={{ alignItems: 'flex-start' }}>
              <div className="step-num" style={{ marginTop: 4 }}>{idx + 1}</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <textarea className="textarea" style={{ minHeight: 64 }} value={s.instruction} onChange={(e) => setStep(s.id, e.target.value)} placeholder="이 단계의 설명을 적어주세요" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="clock" size={15} color="var(--ink-faint)" />
                  <input className="input" style={{ width: 130, height: 38, padding: '6px 12px', fontSize: 13.5 }} type="number" min="0"
                    value={s.timer ? Math.round(s.timer.durationSeconds / 60) : ''} onChange={(e) => setStepTimer(s.id, e.target.value)} placeholder="타이머(분)" />
                </div>
              </div>
              <button className="line-del" onClick={() => delStep(s.id)} title="삭제"><Icon name="x" size={17} /></button>
            </div>
          ))}
        </div>
        <button className="add-line" style={{ marginTop: 10 }} onClick={addStep}><Icon name="plus" size={15} /> 단계 추가</button>
      </div>

      <div>
        <label className="field-label">메모 (선택)</label>
        <textarea className="textarea" style={{ minHeight: 80 }} value={data.notes} onChange={(e) => set('notes', e.target.value)} placeholder="팁이나 변형 아이디어" />
      </div>

      <div style={{ display: 'flex', gap: 10, position: 'sticky', bottom: 0, background: 'var(--bg)', paddingTop: 6, paddingBottom: 4 }}>
        <button className="btn btn-primary btn-lg btn-block" onClick={submit} disabled={!canSave}>{submitLabel}</button>
      </div>
    </div>
  );
}

Object.assign(window, { RecipeForm });

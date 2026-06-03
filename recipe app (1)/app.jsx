// app.jsx — shell: routing, state, theme, tweaks. Mounts to #root.

const { useState, useEffect, useMemo } = React;

const STORE_KEY = 'recipeapp.recipes.v1';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "homeLayout": "grid",
  "dark": false,
  "brandAccent": "#E2574C",
  "cardRadius": 18
}/*EDITMODE-END*/;

function loadRecipes() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return window.SEED_RECIPES;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [recipes, setRecipes] = useState(loadRecipes);
  const [route, setRoute] = useState({ name: 'home' }); // {name:'home'|'detail'|'settings', id?}
  const [modal, setModal] = useState(null); // null | 'import' | {edit:id} | 'new'
  const [toast, setToast] = useState('');

  // home filter state (persist lightly)
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [cat, setCat] = useState('all');

  const theme = t.dark ? 'dark' : 'light';

  // apply theme + tweak vars to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-accent', t.brandAccent);
    document.documentElement.style.setProperty('--card-radius', t.cardRadius + 'px');
  }, [t.brandAccent, t.cardRadius]);

  // persist recipes
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(recipes)); } catch {}
  }, [recipes]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2200); };

  // CRUD
  const addRecipe = (data) => {
    const now = new Date().toISOString();
    const rec = { ...data, id: 'r-' + window.uid(), createdAt: now, updatedAt: now };
    setRecipes((rs) => [rec, ...rs]);
    return rec;
  };
  const updateRecipe = (id, data) => {
    setRecipes((rs) => rs.map((r) => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r));
  };
  const deleteRecipe = (id) => {
    if (!confirm('이 레시피를 삭제할까요?')) return;
    setRecipes((rs) => rs.filter((r) => r.id !== id));
    setRoute({ name: 'home' });
    showToast('레시피를 삭제했어요');
  };

  const openDetail = (id) => { setRoute({ name: 'detail', id }); window.scrollTo(0, 0); };
  const goHome = () => { setRoute({ name: 'home' }); };

  const current = route.name === 'detail' ? recipes.find((r) => r.id === route.id) : null;
  const editing = modal && modal.edit ? recipes.find((r) => r.id === modal.edit) : null;

  return (
    <div className="app">
      {/* App bar */}
      <header className="appbar">
        <div className="wrap appbar-inner">
          <div className="brand" onClick={goHome}>
            <span className="brand-mark">🍳</span>
            <span className="brand-name">오늘의<span className="accent">레시피</span></span>
          </div>
          <div className="appbar-spacer" />
          <div className="appbar-actions-desktop" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-ai btn-sm" onClick={() => setModal('import')}><Icon name="sparkles" size={17} /> AI 추가</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setModal('new')}><Icon name="plus" size={17} /> 새 레시피</button>
          </div>
          <button className="iconbtn" onClick={() => setRoute({ name: 'settings' })} title="설정"><Icon name="settings" size={21} /></button>
        </div>
      </header>

      {/* Routes */}
      <main style={{ flex: 1 }}>
        {route.name === 'home' && (
          <HomeScreen
            recipes={recipes} layout={t.homeLayout} onOpen={openDetail}
            query={query} setQuery={setQuery} group={group} setGroup={setGroup} cat={cat} setCat={setCat}
          />
        )}
        {route.name === 'detail' && current && (
          <DetailScreen recipe={current} onBack={goHome} onEdit={(id) => setModal({ edit: id })} onDelete={deleteRecipe} />
        )}
        {route.name === 'detail' && !current && (
          <div className="empty"><div className="empty-emoji">🤔</div><div className="empty-title">레시피를 찾을 수 없어요</div><button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={goHome}>목록으로</button></div>
        )}
        {route.name === 'settings' && (
          <SettingsScreen
            theme={theme} setTheme={(th) => setTweak('dark', th === 'dark')} onBack={goHome}
            recipeCount={recipes.length}
            onResetData={() => { if (confirm('샘플 레시피로 되돌릴까요? 현재 목록을 덮어씁니다.')) { setRecipes(window.SEED_RECIPES); showToast('샘플 레시피를 복원했어요'); } }}
            onClearData={() => { if (confirm('정말 모든 레시피를 삭제할까요?')) { setRecipes([]); showToast('모두 삭제했어요'); } }}
          />
        )}
      </main>

      {/* Mobile FABs */}
      {route.name === 'home' && (
        <div className="fab-stack" data-mobile-fab>
          <button className="fab" style={{ background: 'linear-gradient(120deg, #E2574C, #D9683F 60%, #E0A02E)', color: '#fff' }} onClick={() => setModal('import')}><Icon name="sparkles" size={19} /> AI</button>
          <button className="fab" style={{ background: 'var(--accent-ink)', color: 'var(--on-accent)' }} onClick={() => setModal('new')}><Icon name="plus" size={20} /> 추가</button>
        </div>
      )}

      {/* Modals */}
      {modal === 'import' && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <ImportScreen onClose={() => setModal(null)} onSave={(data) => { const r = addRecipe(data); setModal(null); showToast('레시피를 저장했어요'); openDetail(r.id); }} />
          </div>
        </div>
      )}
      {modal === 'new' && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-head"><span className="modal-title">새 레시피</span><button className="iconbtn" onClick={() => setModal(null)}><Icon name="close" size={20} /></button></div>
            <div className="modal-body"><RecipeForm onSubmit={(data) => { const r = addRecipe(data); setModal(null); showToast('레시피를 저장했어요'); openDetail(r.id); }} submitLabel="레시피 저장" /></div>
          </div>
        </div>
      )}
      {editing && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-head"><span className="modal-title">레시피 편집</span><button className="iconbtn" onClick={() => setModal(null)}><Icon name="close" size={20} /></button></div>
            <div className="modal-body"><RecipeForm initial={editing} onSubmit={(data) => { updateRecipe(editing.id, data); setModal(null); showToast('수정했어요'); }} submitLabel="변경사항 저장" /></div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="홈 레이아웃" />
        <TweakRadio label="카드 배치" value={t.homeLayout} options={[{label:'그리드',value:'grid'},{label:'에디토리얼',value:'editorial'},{label:'리스트',value:'list'}]} onChange={(v) => setTweak('homeLayout', v)} />
        <TweakSlider label="카드 모서리" value={t.cardRadius} min={6} max={26} step={2} unit="px" onChange={(v) => setTweak('cardRadius', v)} />
        <TweakSection label="테마" />
        <TweakToggle label="다크 모드" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        <TweakColor label="브랜드 강조색" value={t.brandAccent} options={['#E2574C', '#E0A02E', '#10A37F', '#6C5CE7', '#4F9DF0']} onChange={(v) => setTweak('brandAccent', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

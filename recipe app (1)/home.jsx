// home.jsx — home screen with three layout variants (grid / editorial / list)

function CardMeta({ recipe }) {
  const tl = window.timeLabel(recipe);
  return (
    <div className="card-meta">
      {recipe.ingredients.length > 0 && <span>재료 {recipe.ingredients.length}</span>}
      <span className="dot" />
      <span>{recipe.steps.length}단계</span>
      {tl && (<><span className="dot" /><span className="meta-pill"><Icon name="clock" size={13} stroke={2.2} /> {tl}</span></>)}
    </div>
  );
}

function RecipeCard({ recipe, onOpen }) {
  const cat = window.getCategoryById(recipe.categoryId);
  return (
    <article className="card" onClick={() => onOpen(recipe.id)}>
      <div className="card-media">
        <FoodPlaceholder color={cat.color} label={cat.label + ' 사진'} />
        <span className="card-badge" style={{ color: cat.color }}>
          <span style={{ fontSize: 13 }}>{cat.emoji}</span> {cat.label}
        </span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{recipe.title}</h3>
        {recipe.description && <p className="card-desc">{recipe.description}</p>}
        <CardMeta recipe={recipe} />
      </div>
    </article>
  );
}

function RowCard({ recipe, onOpen }) {
  const cat = window.getCategoryById(recipe.categoryId);
  const tl = window.timeLabel(recipe);
  return (
    <div className="row-card" onClick={() => onOpen(recipe.id)}>
      <div className="row-thumb">
        <FoodPlaceholder color={cat.color} label="" />
        <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 26 }}>{cat.emoji}</span>
      </div>
      <div className="row-main">
        <div className="row-cat" style={{ color: cat.color }}>{cat.label}</div>
        <div className="row-title">{recipe.title}</div>
        <div className="row-desc">{recipe.description}</div>
      </div>
      <div className="card-meta" style={{ marginTop: 0, paddingTop: 0 }}>
        <span>{recipe.steps.length}단계</span>
        {tl && (<><span className="dot" /><span className="meta-pill"><Icon name="clock" size={13} stroke={2.2} />{tl}</span></>)}
      </div>
      <Icon name="chevronRight" size={20} color="var(--ink-faint)" style={{ marginLeft: 4 }} />
    </div>
  );
}

function FeatureCard({ recipe, onOpen }) {
  const cat = window.getCategoryById(recipe.categoryId);
  const tl = window.timeLabel(recipe);
  return (
    <div className="feature" onClick={() => onOpen(recipe.id)}>
      <div className="feature-media">
        <FoodPlaceholder color={cat.color} label={cat.label + ' 대표 사진'} />
        <span className="card-badge" style={{ color: cat.color, top: 18, left: 18 }}>
          <span style={{ fontSize: 13 }}>{cat.emoji}</span> {cat.label}
        </span>
      </div>
      <div className="feature-body">
        <div className="feature-kicker">오늘의 추천 · FEATURED</div>
        <h2 className="feature-title">{recipe.title}</h2>
        <p className="feature-desc">{recipe.description}</p>
        <div className="card-meta" style={{ marginTop: 4 }}>
          <span>재료 {recipe.ingredients.length}</span>
          <span className="dot" /><span>{recipe.steps.length}단계</span>
          {tl && (<><span className="dot" /><span className="meta-pill"><Icon name="clock" size={14} stroke={2.2} />{tl}</span></>)}
        </div>
      </div>
    </div>
  );
}

function CategoryFilter({ group, setGroup, cat, setCat }) {
  const subs = window.CATEGORIES.filter((c) => {
    if (group === 'all') return c.id !== 'other';
    return c.group === group;
  });
  return (
    <div>
      <div className="group-tabs">
        {window.CATEGORY_GROUPS.map((g) => (
          <button key={g.id} className={'group-tab' + (group === g.id ? ' active' : '')} onClick={() => { setGroup(g.id); setCat('all'); }}>
            {g.label}
          </button>
        ))}
      </div>
      <div className="chip-row" style={{ marginTop: 4 }}>
        <button className={'chip' + (cat === 'all' ? ' active' : '')} onClick={() => setCat('all')}>전체</button>
        {subs.map((c) => (
          <button key={c.id} className={'chip' + (cat === c.id ? ' active' : '')} onClick={() => setCat(c.id)}
            style={cat === c.id ? { background: c.color, borderColor: c.color, color: '#fff' } : null}>
            <span className="emoji">{c.emoji}</span> {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function HomeScreen({ recipes, layout, onOpen, query, setQuery, group, setGroup, cat, setCat }) {
  const filtered = React.useMemo(() => {
    let r = recipes;
    if (group !== 'all') r = r.filter((x) => window.getCategoryById(x.categoryId).group === group);
    if (cat !== 'all') r = r.filter((x) => x.categoryId === cat);
    const q = query.trim().toLowerCase();
    if (q) r = r.filter((x) =>
      x.title.toLowerCase().includes(q) ||
      (x.description || '').toLowerCase().includes(q) ||
      x.ingredients.some((i) => i.name.toLowerCase().includes(q)));
    return [...r].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [recipes, group, cat, query]);

  const showFeature = layout === 'editorial' && !query.trim() && filtered.length > 2;
  const feature = showFeature ? filtered[0] : null;
  const rest = showFeature ? filtered.slice(1) : filtered;

  return (
    <div className="screen-enter">
      {/* Hero strip */}
      <div className="wrap" style={{ paddingTop: 30, paddingBottom: 6 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', margin: '0 0 4px' }}>
          무엇을 만들어 볼까요?
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15.5, margin: '0 0 20px' }}>
          저장한 레시피 {recipes.length}개 · 요리부터 커피까지
        </p>
        <div className="search-bar" style={{ maxWidth: 520 }}>
          <Icon name="search" size={19} color="var(--ink-faint)" />
          <input placeholder="레시피, 재료 검색…" value={query} onChange={(e) => setQuery(e.target.value)} />
          {query && <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => setQuery('')}><Icon name="close" size={16} /></button>}
        </div>
      </div>

      {/* Sticky filter */}
      <div style={{ position: 'sticky', top: 68, zIndex: 30, background: 'color-mix(in srgb, var(--bg) 86%, transparent)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--line)', marginTop: 14 }}>
        <div className="wrap" style={{ paddingTop: 4, paddingBottom: 8 }}>
          <CategoryFilter group={group} setGroup={setGroup} cat={cat} setCat={setCat} />
        </div>
      </div>

      {/* Results */}
      <div className="wrap" style={{ paddingTop: 26, paddingBottom: 120 }}>
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-emoji">🍳</div>
            <div className="empty-title">{query || cat !== 'all' ? '검색 결과가 없어요' : '레시피가 없습니다'}</div>
            <div className="empty-desc">{query || cat !== 'all' ? '다른 검색어나 카테고리를 시도해보세요.' : '+ 버튼이나 AI로 첫 레시피를 추가해보세요.'}</div>
          </div>
        ) : (
          <>
            {feature && <FeatureCard recipe={feature} onOpen={onOpen} />}
            <div className="section-head">
              <span className="section-title">{cat === 'all' ? (group === 'coffee' ? '커피' : group === 'cooking' ? '요리' : '전체 레시피') : window.getCategoryById(cat).label}</span>
              <span className="section-count">{filtered.length}개</span>
            </div>
            {layout === 'list' ? (
              <div className="recipe-list">
                {rest.map((r) => <RowCard key={r.id} recipe={r} onOpen={onOpen} />)}
              </div>
            ) : (
              <div className="recipe-grid cols">
                {rest.map((r) => <RecipeCard key={r.id} recipe={r} onOpen={onOpen} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, RecipeCard, RowCard, FeatureCard, CategoryFilter });

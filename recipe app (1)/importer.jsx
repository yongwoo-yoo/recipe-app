// importer.jsx — AI recipe extraction via window.claude.complete (text-based methods)

const IMPORT_METHODS = [
  { id: 'text', icon: 'text', name: '텍스트', desc: '복사한 레시피 붙여넣기' },
  { id: 'youtube', icon: 'youtube', name: 'YouTube', desc: '영상 설명·자막 붙여넣기' },
  { id: 'url', icon: 'link', name: '웹 URL', desc: '레시피 페이지 내용' },
  { id: 'image', icon: 'camera', name: '사진', desc: '레시피 사진 (준비 중)' },
];

const VALID_CATS = window.CATEGORIES.map((c) => c.id).join(', ');

const SAMPLE_TEXT = `김치볶음밥

재료: 찬밥 2공기, 잘 익은 김치 1컵, 스팸 1/2캔, 대파 1대, 계란 2개, 고춧가루 1작은술, 간장 1큰술, 참기름 1큰술, 식용유

만드는 법:
1. 김치와 스팸, 대파를 잘게 썬다.
2. 팬에 식용유를 두르고 스팸을 노릇하게 볶는다.
3. 김치를 넣고 3분간 볶다가 고춧가루를 넣는다.
4. 찬밥을 넣고 간장으로 간하며 잘 섞어 볶는다.
5. 그릇에 담고 계란프라이를 올린 뒤 참기름을 두른다.`;

async function extractRecipe(rawText) {
  const prompt = `다음 내용에서 요리 레시피를 추출해 JSON으로만 응답하세요. 설명 없이 JSON 객체 하나만 출력합니다.

스키마:
{
  "title": "레시피 이름 (한국어)",
  "categoryId": "다음 중 하나: ${VALID_CATS}",
  "description": "한 줄 소개 (한국어, 40자 내외)",
  "servings": "분량 (예: 2인분)",
  "ingredients": [{ "name": "재료명", "quantity": "양 (예: 200g)" }],
  "steps": [{ "instruction": "단계 설명 (한국어)", "timerMinutes": 정수 또는 null }],
  "notes": "팁 (없으면 빈 문자열)"
}

규칙:
- categoryId는 반드시 목록 중 하나. 커피 음료면 espresso/hand-drip/cold-brew, 한국 요리면 korean, 애매하면 other.
- timerMinutes는 끓이기·굽기·재우기처럼 시간이 명시된 단계에만 정수로, 나머지는 null.
- 모든 텍스트는 자연스러운 한국어로.

내용:
"""
${rawText.slice(0, 6000)}
"""`;

  const res = await window.claude.complete(prompt);
  let jsonStr = res.trim();
  const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) jsonStr = fence[1].trim();
  const start = jsonStr.indexOf('{');
  const end = jsonStr.lastIndexOf('}');
  if (start >= 0 && end >= 0) jsonStr = jsonStr.slice(start, end + 1);
  const parsed = JSON.parse(jsonStr);

  const validIds = window.CATEGORIES.map((c) => c.id);
  return {
    title: parsed.title || '제목 없는 레시피',
    categoryId: validIds.includes(parsed.categoryId) ? parsed.categoryId : 'other',
    description: parsed.description || '',
    servings: parsed.servings || '',
    notes: parsed.notes || '',
    ingredients: (parsed.ingredients || []).map((i) => ({ id: window.uid(), name: i.name || '', quantity: i.quantity || '' })),
    steps: (parsed.steps || []).map((s) => ({
      id: window.uid(),
      instruction: s.instruction || '',
      ...(s.timerMinutes ? { timer: { durationSeconds: s.timerMinutes * 60, label: `${s.timerMinutes}분` } } : {}),
    })),
  };
}

function ImportScreen({ onClose, onSave }) {
  const [method, setMethod] = React.useState('text');
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [extracted, setExtracted] = React.useState(null);

  const placeholder = {
    text: '레시피 내용을 여기에 붙여넣어 주세요…',
    youtube: '유튜브 영상의 제목·설명·자막을 붙여넣어 주세요…',
    url: '레시피 페이지의 본문 텍스트를 붙여넣어 주세요…',
    image: '사진 업로드는 준비 중입니다. 텍스트 방식을 이용해 주세요.',
  }[method];

  const run = async () => {
    if (!text.trim()) { setError('추출할 내용을 입력해 주세요.'); return; }
    setError(''); setLoading(true);
    try {
      const result = await extractRecipe(text);
      setExtracted(result);
    } catch (e) {
      setError('레시피를 추출하지 못했어요. 내용을 더 자세히 붙여넣거나 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (extracted) {
    return (
      <>
        <div className="modal-head">
          <span className="modal-title">✨ 추출 결과 확인</span>
          <button className="iconbtn" onClick={onClose}><Icon name="close" size={20} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 12 }}>
            <span style={{ fontSize: 13.5, color: 'var(--ink-soft)', flex: 1 }}>AI가 추출한 내용이에요. 확인·수정 후 저장하세요.</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setExtracted(null)}>다시 추출</button>
          </div>
          <RecipeForm initial={extracted} onSubmit={onSave} submitLabel="레시피 저장" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="modal-head">
        <span className="modal-title">✨ AI로 레시피 추가</span>
        <button className="iconbtn" onClick={onClose}><Icon name="close" size={20} /></button>
      </div>
      <div className="modal-body">
        <label className="field-label">불러올 방법</label>
        <div className="method-grid">
          {IMPORT_METHODS.map((m) => (
            <button key={m.id} className={'method' + (method === m.id ? ' on' : '')} onClick={() => { setMethod(m.id); setError(''); }} disabled={m.id === 'image'} style={m.id === 'image' ? { opacity: 0.5, cursor: 'not-allowed' } : null}>
              <span className="method-ic"><Icon name={m.icon} size={22} /></span>
              <span>
                <span className="method-name">{m.name}</span>
                <span className="method-desc">{m.desc}</span>
              </span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <label className="field-label" style={{ margin: 0 }}>내용 붙여넣기</label>
            <button onClick={() => setText(SAMPLE_TEXT)} style={{ background: 'none', border: 'none', color: '#D9683F', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' }}>예시 채우기</button>
          </div>
          <textarea className="textarea" style={{ minHeight: 180 }} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} disabled={method === 'image'} />
        </div>

        {error && <p style={{ color: '#E2574C', fontSize: 13.5, marginTop: 12 }}>{error}</p>}

        <button className="btn btn-ai btn-lg btn-block" style={{ marginTop: 18 }} onClick={run} disabled={loading || method === 'image'}>
          {loading ? <><span className="spinner" /> 레시피 추출 중…</> : <><Icon name="sparkles" size={19} /> AI로 레시피 추출</>}
        </button>
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
          붙여넣은 내용을 분석해 제목·재료·단계·타이머를 자동으로 정리해요.
        </p>
      </div>
    </>
  );
}

Object.assign(window, { ImportScreen, extractRecipe });

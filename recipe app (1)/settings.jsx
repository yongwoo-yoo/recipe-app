// settings.jsx — appearance, AI status, data management

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 50, height: 30, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 3,
      background: on ? 'var(--accent-ink)' : 'var(--line-strong)', transition: 'background 0.2s ease', display: 'flex',
    }}>
      <span style={{ width: 24, height: 24, borderRadius: 99, background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', transform: on ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s cubic-bezier(.2,.8,.3,1)' }} />
    </button>
  );
}

function SettingRow({ title, desc, children, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: last ? 'none' : '1px solid var(--line)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600 }}>{title}</div>
        {desc && <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 3, lineHeight: 1.5 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function SettingsScreen({ theme, setTheme, onBack, onResetData, onClearData, recipeCount }) {
  const isDark = theme === 'dark';
  return (
    <div className="wrap screen-enter" style={{ maxWidth: 660, paddingTop: 18, paddingBottom: 100 }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 22 }}><Icon name="back" size={17} /> 목록</button>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', margin: '0 0 26px' }}>설정</h1>

      <p className="settings-group-label">외관</p>
      <div className="setting-card" style={{ padding: '8px 24px', marginBottom: 26 }}>
        <SettingRow title="다크 모드" desc="어두운 환경에서 눈이 편안하게">
          <Toggle on={isDark} onChange={(v) => setTheme(v ? 'dark' : 'light')} />
        </SettingRow>
        <SettingRow title="테마 색상" desc="현재: 따뜻한 페이퍼 톤" last>
          <div style={{ display: 'flex', gap: 7 }}>
            {['#E2574C', '#E0A02E', '#10A37F', '#6C5CE7'].map((c) => (
              <span key={c} style={{ width: 24, height: 24, borderRadius: 99, background: c, boxShadow: 'var(--shadow-sm)' }} />
            ))}
          </div>
        </SettingRow>
      </div>

      <p className="settings-group-label">AI 레시피 추출</p>
      <div className="setting-card" style={{ marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 46, height: 46, borderRadius: 13, display: 'grid', placeItems: 'center', background: 'linear-gradient(120deg, #E2574C, #E0A02E)', color: '#fff', flexShrink: 0 }}>
            <Icon name="sparkles" size={24} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700 }}>AI 추출이 켜져 있어요</div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 3, lineHeight: 1.5 }}>별도 API 키 없이 텍스트·YouTube·웹 내용에서 레시피를 자동으로 정리합니다.</div>
          </div>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: '#10A37F', boxShadow: '0 0 0 4px color-mix(in srgb, #10A37F 22%, transparent)' }} />
        </div>
      </div>

      <p className="settings-group-label">데이터</p>
      <div className="setting-card" style={{ padding: '8px 24px' }}>
        <SettingRow title="저장된 레시피" desc={`현재 ${recipeCount}개의 레시피가 이 브라우저에 저장되어 있어요.`}>
          <button className="btn btn-outline btn-sm" onClick={onResetData}>샘플 복원</button>
        </SettingRow>
        <SettingRow title="모두 삭제" desc="저장된 모든 레시피를 지웁니다." last>
          <button className="btn btn-danger btn-sm" onClick={onClearData}>전체 삭제</button>
        </SettingRow>
      </div>

      <p className="setting-hint" style={{ marginTop: 28 }}>레시피는 이 브라우저에만 저장되며 외부로 전송되지 않습니다.</p>
    </div>
  );
}

Object.assign(window, { SettingsScreen });

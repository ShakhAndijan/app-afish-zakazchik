/* global React */
/* ============================================================
   AFISH.uz — Login (kirish) ekrani
   Mustaqil komponent. Zakazchi va Usta uchun.
   Foydalanish:  <script type="text/babel" src="login.jsx"></script>
   Eksport (window): AfishLoginZakazchi, AfishLoginUsta
   ============================================================ */

/* ---------- Ikonlar ---------- */
function LgIcon({ name, size = 24, stroke = 2, fill = false, color = 'currentColor', style }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'check':   return (<svg {...c}><circle cx="12" cy="12" r="9.5" /><path d="M8 12.2l2.6 2.6L16 9.4" /></svg>);
    case 'arrow':   return (<svg {...c}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
    case 'back':    return (<svg {...c}><path d="M15 5l-7 7 7 7" /></svg>);
    case 'mail':    return (<svg {...c}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 5.5L20 7" /></svg>);
    case 'star':    return (<svg {...c} fill={color} stroke="none"><path d="M12 3.2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z" /></svg>);
    case 'bolt':    return (<svg {...c} fill={color} stroke="none"><path d="M13 2L4.5 13.2H11l-1 8.8 8.5-11.3H12z" /></svg>);
    case 'wrench':  return (<svg {...c}><path d="M15.5 7.5a3.5 3.5 0 01-4.6 4.6L5.5 17.5a2 2 0 102.9 2.9l5.5-5.4a3.5 3.5 0 004.6-4.6l-2.1 2.1-2.4-.5-.5-2.4z" /></svg>);
    case 'brush':   return (<svg {...c}><path d="M9.5 14.5l-2.8 2.8a2 2 0 01-3-2.6l.2-.2 2.8-2.8" /><path d="M11 13l7.5-7.5a2.1 2.1 0 013 3L14 16" /><path d="M5.5 17.5c0 1.4-.6 2.8-1.5 3.5 1.8.3 4 0 4.8-2" /></svg>);
    case 'hammer':  return (<svg {...c}><path d="M14 6l4 4M16.5 3.5l4 4-3 3-4-4z" /><path d="M13.5 8.5L5 17a2 2 0 102.8 2.8L16 11" /></svg>);
    case 'wallet':  return (<svg {...c}><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18" /><circle cx="16.5" cy="14.5" r="1.3" fill={color} stroke="none" /></svg>);
    case 'sun':     return (<svg {...c}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>);
    case 'moon':    return (<svg {...c}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>);
    case 'gear':    return (<svg {...c}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 13.5a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.9 1.2v.2a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.6 1.7 1.7 0 00-1.9.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00-1.2-2.9H3a2 2 0 110-4h.1A1.7 1.7 0 004.7 8a1.7 1.7 0 00-.4-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3 1.7 1.7 0 001-1.5V2a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.4l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.5 1H22a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>);
    case 'google':  return (<svg width={size} height={size} viewBox="0 0 24 24" style={style}><path d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.24c1.9-1.75 3-4.33 3-7.3z" fill="#4285F4"/><path d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.24-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.13H3.06v2.6A10 10 0 0012 22z" fill="#34A853"/><path d="M6.41 13.9a6 6 0 010-3.8V7.5H3.06a10 10 0 000 9z" fill="#FBBC05"/><path d="M12 5.97c1.47 0 2.78.5 3.82 1.5l2.85-2.86A10 10 0 003.06 7.5l3.35 2.6C7.2 7.73 9.4 5.97 12 5.97z" fill="#EA4335"/></svg>);
    default: return null;
  }
}

/* ---------- Umumiy bo'laklar ---------- */
function LgStatusBar({ theme }) {
  return (
    <div className="lg-statusbar">
      <span>9:41</span>
      <div className="lg-sb-icons">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="13" width="3.4" height="7" rx="1" /><rect x="7.5" y="9.5" width="3.4" height="10.5" rx="1" /><rect x="13" y="6" width="3.4" height="14" rx="1" /><rect x="18.5" y="3" width="3.4" height="17" rx="1" /></svg>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8.5C7.5 4 16.5 4 22 8.5M5 12c4-3 10-3 14 0M8.5 15.5c2-1.4 5-1.4 7 0" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /></svg>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="18" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" /><rect x="4" y="9" width="13" height="6" rx="1.4" fill="currentColor" /><rect x="21" y="10" width="2" height="4" rx="1" fill="currentColor" /></svg>
      </div>
    </div>
  );
}

function LgBrand({ size = 30, usta = false }) {
  return (
    <span className="lg-logo">
      <span className="lg-brand">
        <span className="lg-brand-mark"><LgIcon name="check" size={size + 4} stroke={2.4} color="#f07a30" /></span>
        <span className="lg-brand-text" style={{ fontSize: size }}><span className="lg-b-afish">AFISH</span><span className="lg-b-uz">.uz</span></span>
      </span>
      {usta && <span className="lg-usta-pill">USTA</span>}
    </span>
  );
}

function LgTopBar({ theme, onThemeToggle }) {
  return (
    <div className="lg-top">
      <button className="lg-back" type="button" aria-label="Orqaga">
        <LgIcon name="back" size={22} />
      </button>
      <button className="lg-theme-btn" type="button" aria-label="Mavzu almashtirish" onClick={onThemeToggle}>
        <div className="lg-theme-track">
          <div className="lg-theme-thumb">
            {theme === 'dark'
              ? <LgIcon name="moon" size={13} color="#a0a8c0" stroke={1.8} />
              : <LgIcon name="sun" size={13} color="#f07a30" stroke={1.8} />
            }
          </div>
        </div>
      </button>
    </div>
  );
}

function LgUzFlag() {
  return (
    <svg width="26" height="18" viewBox="0 0 26 18"><rect width="26" height="18" rx="3" fill="#1eb53a"/><rect width="26" height="11.5" rx="3" fill="#0099b5"/><rect y="6" width="26" height="6" fill="#fff"/><rect y="6.6" width="26" height="4.8" fill="#ce1126"/><rect y="7.4" width="26" height="3.2" fill="#fff"/><circle cx="6" cy="9" r="1.7" fill="#fff"/><circle cx="6.7" cy="9" r="1.7" fill="#0099b5"/></svg>
  );
}

function LgPhoneField({ value, onChange }) {
  const controlled = typeof onChange === 'function';
  return (
    <label className="lg-field">
      <span className="lg-label">Telefon raqami</span>
      <div className="lg-input">
        <span className="lg-flag"><LgUzFlag /></span>
        <span className="lg-code">+998</span>
        <span className="lg-sep" />
        <input
          className="lg-phone"
          type="tel"
          inputMode="numeric"
          placeholder="90 123 45 67"
          value={controlled ? value : undefined}
          onChange={controlled ? (e) => onChange(e.target.value) : undefined}
          readOnly={!controlled}
        />
      </div>
    </label>
  );
}

function LgSocial() {
  return (
    <React.Fragment>
      <div className="lg-or"><span>yoki</span></div>
      <div className="lg-social">
        <button className="lg-soc lg-soc-g" type="button"><LgIcon name="google" size={22} /> Google</button>
        <button className="lg-soc lg-soc-m" type="button"><LgIcon name="mail" size={20} /> Email</button>
      </div>
    </React.Fragment>
  );
}

function LgFooter({ regText }) {
  return (
    <div className="lg-foot">
      <p className="lg-terms">Davom etish orqali <b>Shartlar</b> va <b>Maxfiylik siyosati</b>ga rozilik bildirasiz.</p>
      <p className="lg-reg">{regText} <a href="#">Ro'yxatdan o'tish</a></p>
    </div>
  );
}

/* ---------- Zakazchi login ---------- */
const LG_SERVICES = [
  { name: 'Santexnik', color: '#22b8cf', icon: 'wrench' },
  { name: 'Elektrik',  color: '#ffd43b', icon: 'bolt'   },
  { name: "Bo'yoqchi", color: '#ff7ab8', icon: 'brush'  },
  { name: 'Duradgor',  color: '#9775fa', icon: 'hammer' },
];

function AfishLoginZakazchi({ onSubmit, initialTheme = 'dark' }) {
  const [phone, setPhone] = React.useState('');
  const [theme, setTheme] = React.useState(initialTheme);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className={'afish-login' + (theme === 'light' ? ' light' : '')}>
      <LgStatusBar theme={theme} />
      <LgTopBar theme={theme} onThemeToggle={toggleTheme} />
      <div className="lg-body">
        <div className="lg-hero">
          <div className="lg-orb" />
          <LgBrand size={30} />
          <h1 className="lg-h1">Xush kelibsiz!</h1>
          <p className="lg-sub">Hisobingizga kiring va ishonchli ustalarga buyurtma bering.</p>
        </div>
        <div className="lg-chiprow">
          {LG_SERVICES.map((s) => (
            <span className="lg-chip" key={s.name}>
              <LgIcon name={s.icon} size={16} color={s.color} fill={s.icon === 'bolt'} /> {s.name}
            </span>
          ))}
        </div>
        <LgPhoneField value={phone} onChange={setPhone} />
        <button className="lg-btn lg-cta" type="button" onClick={() => onSubmit && onSubmit(phone)}>
          SMS kod yuborish <LgIcon name="arrow" size={19} />
        </button>
        <LgSocial />
        <LgFooter regText="Hisobingiz yo'qmi?" />
      </div>
    </div>
  );
}

/* ---------- Usta login ---------- */
function AfishLoginUsta({ onSubmit, initialTheme = 'dark' }) {
  const [phone, setPhone] = React.useState('');
  const [theme, setTheme] = React.useState(initialTheme);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className={'afish-login' + (theme === 'light' ? ' light' : '')}>
      <LgStatusBar theme={theme} />
      <LgTopBar theme={theme} onThemeToggle={toggleTheme} />
      <div className="lg-body">
        <div className="lg-hero">
          <div className="lg-orb lg-orb-usta" />
          <LgBrand size={30} usta />
          <h1 className="lg-h1">Ishni boshlaymizmi?</h1>
          <p className="lg-sub">Hisobingizga kirib buyurtmalarni qabul qiling va daromad oling.</p>
        </div>
        <div className="lg-stats">
          <div className="lg-stat"><LgIcon name="bolt" size={18} color="#f5b81f" fill /><div><b>5 000+</b><span>oylik ish</span></div></div>
          <div className="lg-stat"><LgIcon name="wallet" size={18} color="#2ecc71" /><div><b>24 soat</b><span>to'lov</span></div></div>
          <div className="lg-stat"><LgIcon name="star" size={18} color="#f5b81f" /><div><b>4.8</b><span>reyting</span></div></div>
        </div>
        <LgPhoneField value={phone} onChange={setPhone} />
        <button className="lg-btn lg-cta" type="button" onClick={() => onSubmit && onSubmit(phone)}>
          SMS kod yuborish <LgIcon name="arrow" size={19} />
        </button>
        <LgSocial />
        <LgFooter regText="Usta sifatida yangimisiz?" />
      </div>
    </div>
  );
}

Object.assign(window, { AfishLoginZakazchi, AfishLoginUsta, LgIcon });

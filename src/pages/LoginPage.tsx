import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const { doLogin } = useApp();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [mounted, setMounted]   = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    emailRef.current?.focus();
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      await doLogin(email.trim(), password);
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
        setError('Invalid email or password.');
      } else if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        setError('Cannot reach the server. Check your connection.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .cc-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; display: flex; background: #0a0f1a; }

        /* ── Left panel ── */
        .cc-left {
          position: relative; width: 46%;
          background: linear-gradient(145deg, #06111f 0%, #0c1e35 60%, #0a2a1e 100%);
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          overflow: hidden; padding: 3rem 2.5rem;
        }
        @media (max-width: 768px) { .cc-left { display: none; } }

        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.35; pointer-events: none; }
        .orb-b { width: 320px; height: 320px; background: #0f6fbd; top: -60px; right: -80px; }
        .orb-g { width: 260px; height: 260px; background: #25d366; bottom: 40px; left: -60px; }

        .phone-shell {
          position: relative; width: 200px; height: 340px;
          background: #111b21; border-radius: 32px;
          border: 2px solid rgba(255,255,255,0.12);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6); overflow: hidden; flex-shrink: 0;
        }
        .phone-bar {
          height: 36px; background: #1f2c34;
          display: flex; align-items: center; padding: 0 12px; gap: 8px;
        }
        .phone-ava {
          width: 24px; height: 24px; border-radius: 50%;
          background: linear-gradient(135deg,#25d366,#128c7e);
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:700;color:#fff;
        }
        .phone-name { font-size:11px;color:#e9edef;font-weight:600;font-family:'Sora',sans-serif; }
        .phone-body { padding:10px 8px;display:flex;flex-direction:column;gap:6px;background:#111b21; }
        .msg {
          max-width:75%;padding:6px 10px;border-radius:12px;
          font-size:10px;line-height:1.4;
          animation: msgIn 0.4s ease both;
        }
        .msg-t { background:#1f2c34;color:#e9edef;border-bottom-left-radius:3px;align-self:flex-start;border:1px solid rgba(255,255,255,0.07); }
        .msg-m { background:#005c4b;color:#fff;border-bottom-right-radius:3px;align-self:flex-end; }
        .msg:nth-child(1){animation-delay:0.6s}.msg:nth-child(2){animation-delay:1.2s}
        .msg:nth-child(3){animation-delay:1.8s}.msg:nth-child(4){animation-delay:2.4s}
        .msg:nth-child(5){animation-delay:3.0s}
        @keyframes msgIn { from{opacity:0;transform:translateY(8px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }

        /* ── Right panel ── */
        .cc-right { flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:3rem 2rem;background:#0d1117; }

        .cc-card { width:100%;max-width:400px;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);opacity:0;transform:translateY(24px); }
        .cc-card.in { opacity:1;transform:translateY(0); }

        .brand { display:flex;align-items:center;gap:10px;margin-bottom:2.5rem; }
        .brand-icon {
          width:40px;height:40px;border-radius:12px;
          background:linear-gradient(135deg,#0f6fbd,#25d366);
          display:flex;align-items:center;justify-content:center;font-size:20px;
          box-shadow:0 4px 16px rgba(15,111,189,0.4);
        }
        .brand-name { font-family:'Sora',sans-serif;font-weight:800;font-size:1.3rem;color:#f0f6fc;letter-spacing:-0.02em; }
        .brand-name span { color:#25d366; }

        .cc-h1 { font-family:'Sora',sans-serif;font-size:1.75rem;font-weight:700;color:#f0f6fc;margin-bottom:0.4rem;letter-spacing:-0.025em; }
        .cc-sub { color:#8b949e;font-size:0.875rem;margin-bottom:2rem; }

        .field { display:flex;flex-direction:column;gap:6px;margin-bottom:1rem; }
        .field label { font-size:0.78rem;font-weight:600;color:#8b949e;letter-spacing:0.05em;text-transform:uppercase; }
        .iw { position:relative; }
        .field input {
          width:100%;background:#161b22;border:1px solid #30363d;border-radius:10px;
          color:#f0f6fc;font-family:'DM Sans',sans-serif;font-size:0.9rem;
          padding:11px 14px;outline:none;box-sizing:border-box;
          transition:border-color 0.2s,box-shadow 0.2s;
        }
        .field input:focus { border-color:#0f6fbd;box-shadow:0 0 0 3px rgba(15,111,189,0.18); }
        .field input::placeholder { color:#484f58; }

        .pw-btn {
          position:absolute;right:12px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:#484f58;padding:2px;
          display:flex;align-items:center;transition:color 0.15s;
        }
        .pw-btn:hover { color:#8b949e; }

        .err {
          background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);
          border-radius:10px;padding:10px 14px;color:#f87171;font-size:0.82rem;
          margin-bottom:1.2rem;display:flex;align-items:flex-start;gap:8px;
        }

        .btn-submit {
          width:100%;padding:12px;
          background:linear-gradient(135deg,#0f6fbd,#0d5fa0);
          border:none;border-radius:10px;color:#fff;
          font-family:'Sora',sans-serif;font-size:0.9rem;font-weight:600;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
          transition:opacity 0.2s,transform 0.15s,box-shadow 0.2s;
          box-shadow:0 4px 16px rgba(15,111,189,0.35);margin-top:0.5rem;
        }
        .btn-submit:hover:not(:disabled) { opacity:0.92;transform:translateY(-1px);box-shadow:0 6px 20px rgba(15,111,189,0.45); }
        .btn-submit:active:not(:disabled) { transform:translateY(0); }
        .btn-submit:disabled { opacity:0.55;cursor:not-allowed; }

        .spin { width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .demo {
          margin-top:1.75rem;padding:12px 14px;
          background:#161b22;border:1px solid #30363d;border-radius:10px;
          font-size:0.78rem;color:#8b949e;line-height:1.8;
        }
        .demo strong { color:#c9d1d9; }
        .demo .cp { color:#0f6fbd;cursor:pointer;text-decoration:underline;text-underline-offset:2px; }
        .demo .cp:hover { color:#22a0fb; }

        .footer { margin-top:2rem;text-align:center;font-size:0.73rem;color:#484f58; }
      `}</style>

      <div className="cc-root">

        {/* Left */}
        <div className="cc-left">
          <div className="orb orb-b" /><div className="orb orb-g" />

          <div className="phone-shell">
            <div className="phone-bar">
              <div className="phone-ava">P</div>
              <span className="phone-name">Priya W.</span>
            </div>
            <div className="phone-body">
              <div className="msg msg-t">Hi, I need a quote for website development 🙏</div>
              <div className="msg msg-m">Sure! What are your requirements?</div>
              <div className="msg msg-t">E-commerce, 50 products, payment gateway</div>
              <div className="msg msg-m">LKR 185,000 – sending detailed quote now ✅</div>
              <div className="msg msg-t">Perfect! Let's proceed 🎉</div>
            </div>
          </div>

          <div style={{ marginTop:'2rem',textAlign:'center',position:'relative',zIndex:1 }}>
            <p style={{ fontFamily:'Sora,sans-serif',fontSize:'1.15rem',fontWeight:700,color:'#f0f6fc',letterSpacing:'-0.02em',marginBottom:'0.4rem' }}>
              Close deals from your inbox.
            </p>
            <p style={{ fontSize:'0.82rem',color:'#8b949e',maxWidth:260,margin:'0 auto' }}>
              WhatsApp-first CRM built for Sri Lankan businesses.
            </p>
            <div style={{ display:'flex',gap:'1.5rem',justifyContent:'center',marginTop:'1.5rem' }}>
              {[['💬','WhatsApp'],['🧾','VAT Invoices'],['🌐','EN / SI / TA']].map(([n,l]) => (
                <div key={l} style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:'Sora,sans-serif',fontSize:'1.1rem',fontWeight:800,color:'#25d366' }}>{n}</div>
                  <div style={{ fontSize:'0.7rem',color:'#8b949e' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="cc-right">
          <div className={`cc-card ${mounted ? 'in' : ''}`}>

            <div className="brand">
              <div className="brand-icon">💬</div>
              <div className="brand-name">Chat<span>Close</span> LK</div>
            </div>

            <h1 className="cc-h1">Welcome back</h1>
            <p className="cc-sub">Sign in to your workspace to continue</p>

            <form onSubmit={handleSubmit} noValidate>

              <div className="field">
                <label htmlFor="cc-email">Email address</label>
                <div className="iw">
                  <input
                    ref={emailRef}
                    id="cc-email"
                    type="email"
                    placeholder="you@yourcompany.lk"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="cc-password">Password</label>
                <div className="iw">
                  <input
                    id="cc-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button type="button" className="pw-btn" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    {showPw
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {error && (
                <div className="err">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:1}}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={loading || !email || !password}>
                {loading
                  ? <><div className="spin" />Signing in…</>
                  : <>Sign in <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                }
              </button>
            </form>

            {/* Demo credentials – click to auto-fill */}
            <div className="demo">
              <div style={{ fontWeight:600,color:'#c9d1d9',marginBottom:2 }}>Demo credentials</div>
              <div>Email: <span className="cp" onClick={() => setEmail('owner@colombotech.lk')}>owner@colombotech.lk</span></div>
              <div>Password: <span className="cp" onClick={() => setPassword('Admin1234!')}>Admin1234!</span></div>
              <div style={{ marginTop:4,fontSize:'0.72rem',color:'#484f58' }}>
                Tenant: <strong>colombo-tech</strong> · Role: OWNER
              </div>
            </div>

            <p className="footer">ChatClose LK © 2026 · Sri Lanka 🇱🇰</p>
          </div>
        </div>

      </div>
    </>
  );
}
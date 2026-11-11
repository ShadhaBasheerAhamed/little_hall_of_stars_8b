import { useEffect, useState } from 'react';
import { LuLock } from 'react-icons/lu';
import { ADMIN_HASH } from '../config.js';
import { loginAdmin, sha256 } from '../auth.js';
import { navigate } from '../router.jsx';

// Teacher sign-in. The passcode is checked against a SHA-256 hash that is baked in at build time
// (see build.mjs). This keeps the passcode out of the source, but it is still a browser-only check:
// before real production use, move it behind a server login.
export default function AdminLogin() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Teacher's desk · The Little Hall of Stars";
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const ok = ADMIN_HASH && (await sha256(code)) === ADMIN_HASH;
    await new Promise((r) => setTimeout(r, 450)); // small pause slows down guessing
    setBusy(false);
    if (!ok) {
      setError('That passcode is not right.');
      setCode('');
      return;
    }
    loginAdmin();
    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <main className="login admin-login">
      <form className="login-card paper paper--framed page-enter" onSubmit={submit}>
        <LuLock className="login-star" aria-hidden="true" />
        <p className="eyebrow">Teacher's desk</p>
        <h1 className="login-title">Welcome back, Shadha Mam</h1>
        <p className="login-sub">Enter your passcode to edit your students' pages.</p>
        <label className="field">
          <span className="field-label">Passcode</span>
          <input type="password" className="input" autoComplete="current-password" value={code} onChange={(e) => setCode(e.target.value)} autoFocus />
        </label>
        <p className="pin-error" role="alert">
          {error}
        </p>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy || !code}>
          {busy ? 'Checking…' : 'Open the desk'}
        </button>
      </form>
    </main>
  );
}

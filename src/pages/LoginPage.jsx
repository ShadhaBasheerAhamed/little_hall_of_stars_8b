import { useEffect, useRef, useState } from 'react';
import { LuKeyRound } from 'react-icons/lu';
import { findByPin } from '../data/students.js';
import { loginStudent } from '../auth.js';
import { navigate } from '../router.jsx';
import { CLASS_SIZE } from '../config.js';
import Starfield from '../components/common/Starfield.jsx';
import Sparkle from '../components/common/Sparkle.jsx';

const LEN = 3;

export default function LoginPage({ students, query }) {
  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const refs = useRef([]);

  // A QR card carries only the star number (never the PIN) so we can greet the right card.
  const cardStudent = query && query.star ? students.find((s) => String(s.rollNumber) === query.star) : null;

  useEffect(() => {
    document.title = 'The Little Hall of Stars';
    if (refs.current[0]) refs.current[0].focus();
  }, []);

  const setAt = (i, v) =>
    setDigits((d) => {
      const n = d.slice();
      n[i] = v;
      return n;
    });

  const onChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '');
    setError('');
    if (!v) return setAt(i, '');
    if (v.length > 1) return fill(v, i);
    setAt(i, v);
    if (i < LEN - 1) refs.current[i + 1].focus();
  };

  const fill = (text, start = 0) => {
    const chars = text.replace(/\D/g, '').slice(0, LEN - start).split('');
    if (!chars.length) return;
    setDigits((d) => {
      const n = d.slice();
      chars.forEach((c, k) => {
        n[start + k] = c;
      });
      return n;
    });
    const next = Math.min(start + chars.length, LEN - 1);
    refs.current[next].focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1].focus();
      setAt(i - 1, '');
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1].focus();
    if (e.key === 'ArrowRight' && i < LEN - 1) refs.current[i + 1].focus();
  };

  const submit = (e) => {
    e.preventDefault();
    const pin = digits.join('');
    const found = pin.length === LEN ? findByPin(students, pin) : null;
    if (!found) {
      setError(pin.length < LEN ? 'Please fill in all three numbers.' : "Hmm, that PIN didn't open a little world. Check the number and try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (pin.length === LEN) {
        setDigits(Array(LEN).fill(''));
        refs.current[0].focus();
      }
      return;
    }
    loginStudent(found.rollNumber);
    navigate('/me', { replace: true });
  };

  return (
    <main className="login">
      <Starfield count={44} seed={29} />
      <div className="login-card paper paper--framed page-enter">
        <Sparkle className="login-star" />
        <p className="eyebrow">Class 8B</p>
        <h1 className="login-title">The world has {CLASS_SIZE} little stars. Find yours.</h1>
        <p className="login-sub">Enter your special PIN to unlock your little world.</p>
        {cardStudent && <p className="login-card-hint hand">This card belongs to {cardStudent.name} ✨</p>}

        <form onSubmit={submit} noValidate>
          <fieldset className={`pin${shake ? ' shake' : ''}`}>
            <legend className="sr-only">Your {LEN}-digit PIN</legend>
            <div className="pin-row">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  className="pin-box"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  maxLength={LEN}
                  value={d}
                  aria-label={`PIN digit ${i + 1} of ${LEN}`}
                  aria-invalid={error ? 'true' : undefined}
                  aria-describedby={error ? 'pin-error' : undefined}
                  onChange={(e) => onChange(i, e)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  onPaste={(e) => {
                    e.preventDefault();
                    fill(e.clipboardData.getData('text'), 0);
                  }}
                />
              ))}
            </div>
          </fieldset>
          <p id="pin-error" className="pin-error" role="alert">
            {error}
          </p>
          <button type="submit" className="btn btn-primary btn-lg btn-block">
            <LuKeyRound aria-hidden="true" /> Unlock my little world
          </button>
        </form>
        <p className="login-foot muted">Forgot your PIN? Ask Shadha Mam.</p>
      </div>
    </main>
  );
}

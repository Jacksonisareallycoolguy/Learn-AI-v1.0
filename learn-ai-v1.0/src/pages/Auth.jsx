import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, USERNAME_RULE } from '../lib/auth.jsx';
import { useTitle } from '../lib/hooks.js';
import Logo from '../components/Logo.jsx';

function Plus({ style }) {
  return (
    <svg className="plus-deco" style={style} viewBox="0 0 7 7" aria-hidden="true" shapeRendering="crispEdges">
      <path fill="#67e8f9" d="M2 0h3v2h2v3H5v2H2V5H0V2h2z" />
    </svg>
  );
}

export default function Auth({ mode }) {
  const isSignup = mode === 'signup';
  useTitle(isSignup ? 'Sign up' : 'Log in');
  const { session, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session && !busy) return <Navigate to="/learn" replace />;

  const validate = () => {
    if (!USERNAME_RULE.test(username.trim())) {
      return 'Usernames are 3 to 20 characters: letters, numbers, and underscores only.';
    }
    if (isSignup && password.length < 8) return 'Your password needs at least 8 characters.';
    if (!password) return 'Enter your password.';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setBusy(true);
    try {
      if (isSignup) await signUp(username, password);
      else await signIn(username, password);
      navigate(location.state?.from || '/learn', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="home-top">
        <Logo />
        <Link className="btn btn-outline btn-small" to="/">Home</Link>
      </header>
      <main id="main" className="auth-main">
        <Plus style={{ left: '14%', top: '16%' }} />
        <Plus style={{ left: '26%', top: '52%' }} />
        <Plus style={{ left: '9%', top: '78%' }} />
        <Plus style={{ right: '12%', top: '30%' }} />
        <Plus style={{ right: '16%', top: '74%' }} />

        <form className="auth-card" onSubmit={onSubmit} noValidate>
          <h1>{isSignup ? 'Sign up' : 'Log in'}</h1>

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-describedby={isSignup ? 'username-hint' : undefined}
              required
            />
            {isSignup && <p id="username-hint" className="hint">3 to 20 characters: letters, numbers, and underscores.</p>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="pw-wrap">
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={isSignup ? 'password-hint' : undefined}
                required
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)} aria-pressed={showPw}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            {isSignup && <p id="password-hint" className="hint">At least 8 characters. There is no password reset, so remember it.</p>}
          </div>

          <p className="form-error" role="alert" aria-live="assertive">{error}</p>

          <button type="submit" className="btn btn-pink btn-block" disabled={busy}>
            {busy ? (isSignup ? 'Creating account…' : 'Logging in…') : isSignup ? 'Create account' : 'Log in'}
          </button>

          <p className="auth-switch">
            {isSignup ? (
              <>Already have an account? <Link to="/login" state={location.state}>Log in</Link></>
            ) : (
              <>New here? <Link to="/signup" state={location.state}>Sign up</Link></>
            )}
          </p>
        </form>
      </main>
    </div>
  );
}

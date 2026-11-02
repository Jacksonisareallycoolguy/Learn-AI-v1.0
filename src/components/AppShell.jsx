import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import Logo from './Logo.jsx';
import { HomeIcon, ListIcon, UserIcon, LogoutIcon } from './Icons.jsx';

export function ProfileMenu({ placement = 'side' }) {
  const { username, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className={`profile-menu profile-menu-${placement}`} ref={ref}>
      {placement === 'top' ? (
        <button
          type="button"
          className="avatar-btn"
          aria-label={`Account menu for ${username}`}
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {(username || '?').slice(0, 1).toUpperCase()}
        </button>
      ) : (
        <button
          type="button"
          className="nav-item"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <UserIcon />
          <span className="nav-label">Account</span>
        </button>
      )}
      {open && (
        <div className="menu-pop" role="menu">
          <p className="menu-name">Signed in as <strong>{username}</strong></p>
          <button type="button" role="menuitem" className="btn btn-ghost btn-small" onClick={handleSignOut}>
            <LogoutIcon width={18} height={18} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ children }) {
  return (
    <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="shell-top">
        <Logo to="/learn" />
      </header>
      <nav className="shell-nav" aria-label="Main">
        <NavLink to="/progress" className="nav-item">
          <HomeIcon />
          <span className="nav-label">Dashboard</span>
        </NavLink>
        <NavLink to="/learn" className="nav-item">
          <ListIcon />
          <span className="nav-label">Lessons</span>
        </NavLink>
        <ProfileMenu />
      </nav>
      <main id="main" className="shell-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';
import { ProfileMenu } from './AppShell.jsx';

// Used on the lesson page, matching the lesson mockup: logo left, Learn / Progress / avatar right.
export default function TopBar() {
  return (
    <header className="topbar">
      <a className="skip-link" href="#main">Skip to content</a>
      <Logo to="/learn" />
      <nav className="topbar-nav" aria-label="Main">
        <NavLink to="/learn">Learn</NavLink>
        <NavLink to="/progress">Progress</NavLink>
        <ProfileMenu placement="top" />
      </nav>
    </header>
  );
}

import { Link } from 'react-router-dom';
import { useTitle } from '../lib/hooks.js';
import Logo from '../components/Logo.jsx';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <div className="auth-page">
      <header className="home-top"><Logo /></header>
      <main id="main" className="auth-main">
        <div className="auth-card">
          <h1>Page not found</h1>
          <p className="muted">That page does not exist. Head back and pick up where you left off.</p>
          <Link className="btn btn-pink btn-block" to="/">Back to home</Link>
        </div>
      </main>
    </div>
  );
}

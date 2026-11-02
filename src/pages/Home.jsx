import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { useTitle } from '../lib/hooks.js';
import Logo from '../components/Logo.jsx';
import PixelBrain from '../components/PixelBrain.jsx';

const TOPICS = [
  { title: 'AI Fundamentals', text: 'Understand how AI and machine learning work.', color: 'pink' },
  { title: 'Practical AI', text: 'Practice prompting and evaluating AI tools.', color: 'cyan' },
  { title: 'Ethical AI', text: 'Explore privacy, bias and responsible AI use.', color: 'yellow' },
];

export default function Home() {
  useTitle('');
  const { session } = useAuth();

  return (
    <div className="home">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="home-top">
        <Logo />
        {session ? (
          <Link className="btn btn-cyan btn-small" to="/learn">Go to lessons</Link>
        ) : (
          <Link className="btn btn-cyan btn-small" to="/login">Log in</Link>
        )}
      </header>

      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Your AI adventure starts here</p>
            <h1 className="hero-title">
              <span className="hero-line-white">Learn AI.</span>
              <span className="hero-line-pink">Level up your</span>
              <span className="hero-line-white hero-line-future">Future.</span>
            </h1>
            <p className="hero-sub">
              Learn how artificial intelligence works, practice real skills, and make smarter decisions — one challenge at a time.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-pink" to={session ? '/learn' : '/signup'}>Start learning</Link>
              <a className="btn btn-cyan" href="#topics">Explore lessons</a>
            </div>
          </div>
          <div className="hero-art">
            <PixelBrain />
          </div>
        </section>

        <section className="topics" id="topics" aria-labelledby="topics-title">
          <h2 id="topics-title" className="topics-title">Learn about:</h2>
          <ul className="topic-grid">
            {TOPICS.map((t) => (
              <li key={t.title} className="topic-card">
                <span className={`topic-dash topic-dash-${t.color}`} aria-hidden="true" />
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </li>
            ))}
          </ul>
          <p className="topics-note">
            Three short lessons, five questions each. Earn XP, collect badges, and keep your daily streak alive.
          </p>
        </section>
      </main>
    </div>
  );
}

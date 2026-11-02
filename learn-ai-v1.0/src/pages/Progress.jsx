import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appToday, currentWeek, getActivityDates, getAllBadges, getDashboard } from '../lib/api.js';
import { formatDate, useTitle } from '../lib/hooks.js';
import AppShell from '../components/AppShell.jsx';
import BadgeIcon from '../components/BadgeIcon.jsx';
import PixelNode from '../components/PixelNode.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { CheckIcon } from '../components/Icons.jsx';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function Stairs() {
  return (
    <svg className="stairs" viewBox="0 0 120 260" aria-hidden="true" shapeRendering="crispEdges" fill="none" stroke="#67e8f9" strokeWidth="4">
      <path d="M8 8H34V44H62V92H100V120" />
      <rect x="2" y="2" width="14" height="14" fill="#67e8f9" stroke="none" />
      <rect x="92" y="114" width="14" height="14" fill="#67e8f9" stroke="none" />
      <path d="M40 170H70V210H100V250H118" />
    </svg>
  );
}

export default function Progress() {
  useTitle('Dashboard');
  const [data, setData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [activeDays, setActiveDays] = useState(new Set());
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setData(null);
    try {
      const week = currentWeek();
      const [dash, allBadges, dates] = await Promise.all([getDashboard(), getAllBadges(), getActivityDates(week[0])]);
      setData(dash);
      setBadges(allBadges);
      setActiveDays(new Set(dates));
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const week = currentWeek();
  const today = appToday();

  let content;
  if (error) {
    content = (
      <div className="notice notice-error" role="alert">
        <p>We could not load your progress. {error}</p>
        <button type="button" className="btn btn-cyan btn-small" onClick={load}>Try again</button>
      </div>
    );
  } else if (!data) {
    content = (
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading your dashboard</span>
        <Skeleton height={170} />
        <div className="dash-row mt"><Skeleton height={190} /><Skeleton height={190} /></div>
      </div>
    );
  } else {
    const { xp, streak, categories } = data;
    const earned = new Map((data.badges ?? []).map((b) => [b.slug, b]));
    const span = xp.next_level_xp ? xp.next_level_xp - xp.level_start_xp : 0;
    const into = xp.total - xp.level_start_xp;
    const pct = xp.next_level_xp ? Math.min(100, Math.round((into / span) * 100)) : 100;
    const cont = data.continue_lesson;
    const allDone = data.lessons_total > 0 && data.lessons_completed >= data.lessons_total;

    content = (
      <>
        <section className="card streak-card" aria-labelledby="streak-title">
          <PixelNode color="pink" size={96}>{streak.current}</PixelNode>
          <div className="streak-body">
            <h2 id="streak-title">
              {streak.current > 0 ? `${streak.current}-day streak!` : 'Start your streak!'}
            </h2>
            <p className="muted">
              {streak.current === 0
                ? 'Pass a lesson today to begin.'
                : streak.active_today
                ? 'You learned today. Come back tomorrow to keep it going.'
                : 'Pass a lesson today to keep it going.'}
              {streak.longest > 0 ? ` Longest streak: ${streak.longest}.` : ''}
            </p>
          </div>
          <ol className="week" aria-label="This week">
            {week.map((date, i) => {
              const done = activeDays.has(date);
              return (
                <li key={date} className={date === today ? 'is-today' : ''}>
                  <span className="week-letter" aria-hidden="true">{DAY_LETTERS[i]}</span>
                  <span className={`week-box ${done ? 'is-done' : ''}`} aria-hidden="true">{done && <CheckIcon width={14} height={14} strokeWidth={3.4} />}</span>
                  <span className="sr-only">{DAY_NAMES[i]}{date === today ? ' (today)' : ''}: {done ? 'you learned' : 'no lesson'}</span>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="dash-row">
          <section className="card" aria-labelledby="level-title">
            <h2 id="level-title">Level {xp.level}</h2>
            <p className="big-number">{xp.total} <span>XP</span></p>
            <div className="bar" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <span style={{ width: `${pct}%` }} />
            </div>
            <p className="muted">
              {xp.next_level_xp ? `${xp.next_level_xp - xp.total} XP to level ${xp.level + 1}` : 'You reached the top level!'}
            </p>
          </section>

          <section className="card" aria-labelledby="lessons-title">
            <h2 id="lessons-title">Lessons completed</h2>
            <p className="big-number">{data.lessons_completed} <span>of {data.lessons_total}</span></p>
            <div className="bar bar-pink" role="progressbar" aria-label="Overall progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.completion_percent}>
              <span style={{ width: `${data.completion_percent}%` }} />
            </div>
            <ul className="mini-list">
              {categories.map((c) => (
                <li key={c.id}>
                  <span>{c.title}</span>
                  <span className="muted">{c.lessons_completed}/{c.lessons_total}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="dash-row">
          <section className="card" aria-labelledby="continue-title">
            <h2 id="continue-title">Continue learning</h2>
            {allDone ? (
              <>
                <p className="muted">You finished every lesson. Replay any of them for practice.</p>
                <Link className="btn btn-cyan btn-small" to="/learn">Open lessons</Link>
              </>
            ) : cont ? (
              <>
                <p className="muted">
                  {cont.status === 'in_progress' ? 'Pick up your latest lesson.' : 'Your next lesson is ready.'}
                </p>
                <p className="continue-title">{cont.title}</p>
                <Link className="btn btn-pink btn-small" to={`/learn/${cont.lesson_id}`}>
                  {cont.status === 'in_progress' ? 'Continue' : 'Start lesson'}
                </Link>
              </>
            ) : (
              <>
                <p className="muted">Finish the lessons before this one to unlock more.</p>
                <Link className="btn btn-cyan btn-small" to="/learn">Open lessons</Link>
              </>
            )}
          </section>

          <section className="card" aria-labelledby="ach-title">
            <h2 id="ach-title">Your achievements</h2>
            <p className="muted">Badges and milestones</p>
            <ul className="badge-grid">
              {badges.map((b) => {
                const got = earned.get(b.slug);
                return (
                  <li key={b.slug} className={got ? 'badge is-earned' : 'badge'}>
                    <BadgeIcon slug={b.slug} earned={Boolean(got)} />
                    <span className="badge-name">{b.name}</span>
                    <span className="badge-desc">
                      {got ? `Earned ${formatDate(got.earned_at)}` : b.description}
                    </span>
                    <span className="sr-only">{got ? 'Earned' : 'Locked'}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <section className="card" aria-labelledby="recent-title">
          <h2 id="recent-title">Recent activity</h2>
          {data.recent_activity?.length ? (
            <ul className="recent">
              {data.recent_activity.slice(0, 5).map((a, i) => (
                <li key={i}>
                  <span>{a.lesson_title}</span>
                  <span className={a.passed ? 'tag tag-good' : 'tag tag-bad'}>{a.passed ? 'Passed' : 'Try again'} · {a.score_percent}%</span>
                  <span className="muted">{formatDate(a.submitted_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Nothing here yet. Finish your first quick check and it will show up.</p>
          )}
        </section>
      </>
    );
  }

  return (
    <AppShell>
      <h1 className="page-title">Dashboard</h1>
      <div className="dash">
        <div className="dash-main">{content}</div>
        <Stairs />
      </div>
    </AppShell>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { checkAnswer, getCourseMap, getLesson, startLesson, submitQuiz } from '../lib/api.js';
import { useCountUp, useTitle } from '../lib/hooks.js';
import TopBar from '../components/TopBar.jsx';
import BadgeIcon from '../components/BadgeIcon.jsx';
import { PageLoading } from '../components/Skeleton.jsx';
import { CheckIcon, CrossIcon } from '../components/Icons.jsx';
import { flattenCourse, shortModuleName } from './Learn.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function Blocks({ blocks }) {
  return (
    <div className="lesson-blocks">
      {(blocks ?? []).map((b, i) => {
        switch (b.type) {
          case 'heading':
            return <h3 key={i}>{b.text}</h3>;
          case 'text':
            return <p key={i}>{b.body}</p>;
          case 'list':
            return (
              <ul key={i}>
                {(b.items ?? []).map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            );
          case 'callout':
            return (
              <aside key={i} className={`callout callout-${b.tone || 'tip'}`}>
                {b.title && <strong>{b.title}</strong>}
                <p>{b.body}</p>
              </aside>
            );
          case 'compare':
            return (
              <div key={i} className="compare">
                <div className="compare-weak">
                  <span>{b.weak?.label}</span>
                  <p>{b.weak?.text}</p>
                </div>
                <div className="compare-strong">
                  <span>{b.strong?.label}</span>
                  <p>{b.strong?.text}</p>
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function PixelBurst() {
  return (
    <span className="burst" aria-hidden="true">
      {Array.from({ length: 14 }).map((_, i) => (
        <i key={i} style={{ '--a': `${(360 / 14) * i}deg`, '--d': `${70 + (i % 3) * 22}px`, '--c': i % 2 ? '#ff5fa8' : '#67e8f9' }} />
      ))}
    </span>
  );
}

function Results({ result, lesson, questions, answers, nextLesson, wasCompleted, onRetry }) {
  const xp = useCountUp(result.xp_awarded, result.passed);
  const byId = Object.fromEntries((result.results ?? []).map((r) => [r.question_id, r]));
  return (
    <div className="results">
      <section className="card results-card" aria-labelledby="results-title">
        {result.passed && <PixelBurst />}
        <p className="label label-cyan">{result.passed ? 'Lesson complete' : 'Almost there'}</p>
        <h2 id="results-title">
          {result.passed ? 'Nice work!' : 'Not quite yet'}
        </h2>
        <p className="big-score">
          {result.correct_count}<span> / {result.total_questions}</span>
        </p>
        <p className="muted">
          {result.passed
            ? `You scored ${result.score_percent}%.`
            : `You scored ${result.score_percent}%. You need ${lesson.pass_score}% to pass. Read the lesson again and give it another go.`}
        </p>

        {result.passed && (
          <div className="xp-earned" aria-live="polite">
            <span className="xp-amount">+{xp} XP</span>
            <span className="muted">
              {result.xp_awarded > 0
                ? `Level ${result.level} · ${result.total_xp} XP total`
                : wasCompleted
                ? `You already earned the XP for this lesson. Level ${result.level} · ${result.total_xp} XP total`
                : `Level ${result.level} · ${result.total_xp} XP total`}
            </span>
          </div>
        )}

        {result.new_badges?.length > 0 && (
          <div className="new-badges">
            <h3>New badge{result.new_badges.length > 1 ? 's' : ''} unlocked</h3>
            <ul>
              {result.new_badges.map((b) => (
                <li key={b.slug}>
                  <BadgeIcon slug={b.slug} size={44} />
                  <span><strong>{b.name}</strong>{b.xp_reward > 0 ? ` · +${b.xp_reward} XP` : ''}<br /><span className="muted">{b.description}</span></span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="results-actions">
          {result.passed && nextLesson && (
            <Link className="btn btn-pink" to={`/learn/${nextLesson.id}`}>Next lesson</Link>
          )}
          {!result.passed && (
            <button type="button" className="btn btn-pink" onClick={onRetry}>Try again</button>
          )}
          {result.passed && (
            <button type="button" className="btn btn-outline" onClick={onRetry}>Replay for practice</button>
          )}
          <Link className="btn btn-cyan" to={result.passed ? '/progress' : '/learn'}>
            {result.passed ? 'See my progress' : 'Back to lessons'}
          </Link>
        </div>
      </section>

      <section className="card" aria-labelledby="review-title">
        <p className="label label-pink" id="review-title">Review</p>
        <ol className="review-list">
          {questions.map((q, i) => {
            const r = byId[q.id];
            const ok = r?.is_correct;
            const picked = (q.options ?? []).find((o) => o.id === answers[q.id]);
            return (
              <li key={q.id} className={ok ? 'review-ok' : 'review-bad'}>
                <span className="review-icon" aria-hidden="true">{ok ? <CheckIcon width={16} height={16} /> : <CrossIcon width={16} height={16} />}</span>
                <div>
                  <p className="review-q"><span className="sr-only">{ok ? 'Correct. ' : 'Incorrect. '}</span>{i + 1}. {q.question_text}</p>
                  {picked && <p className="muted">Your answer: {picked.text}</p>}
                  {r?.explanation && <p className="review-why">{r.explanation}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

export default function Lesson() {
  const { id } = useParams();
  const lessonId = Number(id);

  const [phase, setPhase] = useState('loading'); // loading | error | locked | missing | quiz | submitting | results
  const [error, setError] = useState('');
  const [lesson, setLesson] = useState(null);
  const [meta, setMeta] = useState(null); // position info from the course map
  const [nextLesson, setNextLesson] = useState(null);
  const [wasCompleted, setWasCompleted] = useState(false);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [checking, setChecking] = useState(false);
  const [actionError, setActionError] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const legendRef = useRef(null);

  useTitle(lesson?.title ?? 'Lesson');

  const load = useCallback(async () => {
    setPhase('loading');
    setError('');
    setIdx(0);
    setSelected('');
    setFeedback(null);
    setAnswers({});
    setResult(null);
    setActionError('');
    try {
      if (!Number.isInteger(lessonId)) {
        setPhase('missing');
        return;
      }
      const flat = flattenCourse(await getCourseMap());
      const position = flat.findIndex((l) => l.id === lessonId);
      if (position === -1) {
        setPhase('missing');
        return;
      }
      const here = flat[position];
      setMeta({ ...here, prev: flat[position - 1] });
      setNextLesson(flat[position + 1] ?? null);
      setWasCompleted(here.status === 'completed');
      if (!here.unlocked) {
        setPhase('locked');
        return;
      }
      await startLesson(lessonId);
      const data = await getLesson(lessonId);
      if (!data || data.questions.length === 0) {
        setPhase('missing');
        return;
      }
      setLesson(data);
      setPhase('quiz');
    } catch (err) {
      if (err.code === '42501') setPhase('locked');
      else {
        setError(err.message || 'Something went wrong.');
        setPhase('error');
      }
    }
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const questions = lesson?.questions ?? [];
  const question = questions[idx];
  const total = questions.length;
  const isLast = idx === total - 1;

  const onCheck = async () => {
    if (!selected || checking) return;
    setChecking(true);
    setActionError('');
    try {
      const res = await checkAnswer(question.id, selected);
      setFeedback(res);
      setAnswers((a) => ({ ...a, [question.id]: selected }));
    } catch (err) {
      setActionError(err.message || 'We could not check that answer. Try again.');
    } finally {
      setChecking(false);
    }
  };

  const onNext = async () => {
    setActionError('');
    if (!isLast) {
      setIdx((i) => i + 1);
      setSelected('');
      setFeedback(null);
      requestAnimationFrame(() => legendRef.current?.focus());
      return;
    }
    setPhase('submitting');
    try {
      const res = await submitQuiz(lessonId, answers);
      setResult(res);
      setPhase('results');
      window.scrollTo({ top: 0 });
    } catch (err) {
      setActionError(err.message || 'We could not submit your answers. Try again.');
      setPhase('quiz');
    }
  };

  const onRetry = () => {
    setWasCompleted(true);
    setIdx(0);
    setSelected('');
    setFeedback(null);
    setAnswers({});
    setResult(null);
    setPhase('quiz');
    window.scrollTo({ top: 0 });
  };

  const crumb = meta ? `${shortModuleName(meta.categoryTitle)} / Lesson ${String(meta.number).padStart(2, '0')}` : '';
  const answered = feedback ? idx + 1 : idx;

  let body;
  if (phase === 'loading') {
    body = <PageLoading label="Loading lesson" />;
  } else if (phase === 'error') {
    body = (
      <div className="notice notice-error" role="alert">
        <p>We could not load this lesson. {error}</p>
        <button type="button" className="btn btn-cyan btn-small" onClick={load}>Try again</button>
      </div>
    );
  } else if (phase === 'locked') {
    body = (
      <div className="notice" role="status">
        <h1 className="page-title">Locked</h1>
        <p>
          {meta?.prev ? `Finish "${meta.prev.title}" first to unlock this lesson.` : 'This lesson is not available yet.'}
        </p>
        <Link className="btn btn-pink btn-small" to="/learn">Back to lessons</Link>
      </div>
    );
  } else if (phase === 'missing') {
    body = (
      <div className="notice" role="status">
        <h1 className="page-title">Lesson not found</h1>
        <p>This lesson does not exist or is not published.</p>
        <Link className="btn btn-pink btn-small" to="/learn">Back to lessons</Link>
      </div>
    );
  } else if (phase === 'results' && result) {
    body = (
      <>
        <p className="crumb">{crumb}</p>
        <h1 className="lesson-title">{lesson.title}</h1>
        <Results
          result={result}
          lesson={lesson}
          questions={questions}
          answers={answers}
          nextLesson={nextLesson}
          wasCompleted={wasCompleted}
          onRetry={onRetry}
        />
      </>
    );
  } else if (lesson && question) {
    const checked = Boolean(feedback);
    const buttonLabel = checking ? 'Checking…' : !checked ? 'Check answer' : isLast ? 'Finish lesson' : 'Next question';
    const buttonDisabled = phase === 'submitting' || checking || (!checked && !selected);
    body = (
      <>
        <p className="crumb">{crumb}</p>
        <h1 className="lesson-title">{lesson.title}</h1>
        <p className="muted lesson-sub">{lesson.description || 'Learn the basics, then test your understanding.'}</p>

        <div className="lesson-grid">
          <div className="lesson-main">
            <section className="card" aria-labelledby="idea-label">
              <p className="label label-pink" id="idea-label">The big idea</p>
              <Blocks blocks={lesson.content?.blocks} />
            </section>

            <section className="card quiz-card" aria-labelledby="quick-label">
              <p className="label label-cyan" id="quick-label">Quick check · Question {idx + 1} of {total}</p>
              <fieldset className="quiz" disabled={checked || phase === 'submitting'}>
                <legend ref={legendRef} tabIndex={-1}>{question.question_text}</legend>
                <div className="options" role="radiogroup">
                  {(question.options ?? []).map((opt, i) => {
                    const isPicked = selected === opt.id;
                    const isRight = checked && feedback.correct_option_id === opt.id;
                    const isWrong = checked && isPicked && !feedback.is_correct;
                    return (
                      <label
                        key={opt.id}
                        className={`option ${isPicked ? 'is-picked' : ''} ${isRight ? 'is-right' : ''} ${isWrong ? 'is-wrong' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q-${question.id}`}
                          value={opt.id}
                          checked={isPicked}
                          onChange={() => setSelected(opt.id)}
                        />
                        <span className="option-letter" aria-hidden="true">{LETTERS[i]}</span>
                        <span className="option-text">{opt.text}</span>
                        {isRight && <span className="option-mark"><CheckIcon width={18} height={18} /><span className="sr-only">Correct answer</span></span>}
                        {isWrong && <span className="option-mark"><CrossIcon width={18} height={18} /><span className="sr-only">Your answer, incorrect</span></span>}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="feedback-region" aria-live="polite">
                {feedback && (
                  <div className={`feedback ${feedback.is_correct ? 'feedback-good' : 'feedback-bad'}`}>
                    <strong>{feedback.is_correct ? 'Correct!' : 'Not quite.'}</strong>
                    {!feedback.is_correct && (
                      <span>
                        {' '}The answer is {LETTERS[(question.options ?? []).findIndex((o) => o.id === feedback.correct_option_id)]}.
                      </span>
                    )}
                    {feedback.explanation && <p>{feedback.explanation}</p>}
                  </div>
                )}
                {actionError && <p className="form-error" role="alert">{actionError}</p>}
              </div>
            </section>
          </div>

          <aside className="reward-panel" aria-label="Lesson progress and reward">
            <div className="reward-info">
              <p className="label">Your reward</p>
              <p className="reward-xp">+{lesson.xp_reward} XP</p>
              <p className="muted reward-note">
                {wasCompleted ? 'You already earned this XP. Replays are for practice.' : 'Complete the lesson to earn XP.'}
              </p>
              <p className="label reward-count">Lesson {meta.number} of {meta.total}</p>
            </div>
            <div
              className="bar"
              role="progressbar"
              aria-label="Questions answered"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={answered}
              aria-valuetext={`${answered} of ${total} questions answered`}
            >
              <span style={{ width: `${(answered / total) * 100}%` }} />
            </div>
            <p className="muted bar-caption">{answered} of {total} answered</p>
            <button
              type="button"
              className="btn btn-cyan btn-block reward-btn"
              onClick={checked ? onNext : onCheck}
              disabled={buttonDisabled}
            >
              {phase === 'submitting' ? 'Scoring…' : buttonLabel}
            </button>
          </aside>
        </div>
      </>
    );
  } else {
    body = <PageLoading label="Loading lesson" />;
  }

  return (
    <div className="lesson-page">
      <TopBar />
      <main id="main" className="lesson-wrap" tabIndex={-1}>
        {body}
      </main>
    </div>
  );
}

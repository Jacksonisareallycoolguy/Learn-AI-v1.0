import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourseMap } from '../lib/api.js';
import { useMediaQuery, useTitle } from '../lib/hooks.js';
import AppShell from '../components/AppShell.jsx';
import PixelNode from '../components/PixelNode.jsx';
import Skeleton from '../components/Skeleton.jsx';

const ORDINALS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

export function flattenCourse(map) {
  const out = [];
  (map ?? []).forEach((cat) => {
    (cat.lessons ?? []).forEach((lesson) => {
      out.push({ ...lesson, categoryTitle: cat.title, categorySlug: cat.slug });
    });
  });
  return out.map((l, i) => ({ ...l, number: i + 1, total: out.length }));
}

export const shortModuleName = (title) => (title || '').replace(/\s+of AI$/i, '');

// Layout numbers for the winding path (kept in one place so the lines always meet the nodes).
const FULL = { node: 76, rowH: 150, xs: [0, 110, 26], boxLeft: 250 };
const COMPACT = { node: 60, rowH: 128, xs: [0, 34, 6], boxLeft: 112 };

function statusOf(lesson) {
  if (!lesson.unlocked) return 'locked';
  if (lesson.status === 'completed') return 'done';
  if (lesson.status === 'in_progress') return 'progress';
  return 'open';
}

function PathLines({ lessons, g }) {
  const height = lessons.length * g.rowH;
  const width = g.boxLeft + 12;
  const cxs = lessons.map((_, i) => g.xs[i % g.xs.length] + g.node / 2);
  const parts = [];
  lessons.forEach((_, i) => {
    const cy = i * g.rowH + g.node / 2;
    // Line from the node to its lesson box.
    parts.push(
      <g key={`b${i}`}>
        <path d={`M${g.xs[i % g.xs.length] + g.node + 4} ${cy} H${g.boxLeft - 20}`} stroke="#67e8f9" strokeWidth="4" />
        <rect x={g.boxLeft - 28} y={cy - 7} width="14" height="14" fill="#67e8f9" />
      </g>
    );
    if (i < lessons.length - 1) {
      const y1 = i * g.rowH + g.node;
      const y2 = (i + 1) * g.rowH;
      const mid = (y1 + y2) / 2;
      parts.push(
        <path key={`c${i}`} d={`M${cxs[i]} ${y1} V${mid} H${cxs[i + 1]} V${y2}`} stroke="#67e8f9" strokeWidth="4" strokeLinejoin="miter" fill="none" />
      );
    }
  });
  // A short stub after the last lesson, like the mockup, to show the path continues.
  const lastCx = cxs[cxs.length - 1];
  const lastBottom = (lessons.length - 1) * g.rowH + g.node;
  parts.push(
    <g key="tail">
      <path d={`M${lastCx} ${lastBottom} V${lastBottom + 20} H${lastCx + 60} V${lastBottom + 46}`} stroke="#67e8f9" strokeWidth="4" fill="none" />
      <rect x={lastCx + 53} y={lastBottom + 44} width="14" height="14" fill="#67e8f9" />
    </g>
  );
  return (
    <svg className="path-lines" width={width} height={height + 70} aria-hidden="true" shapeRendering="crispEdges">
      {parts}
    </svg>
  );
}

function LessonBox({ lesson, g, top, prev }) {
  const state = statusOf(lesson);
  const name = `Lesson ${ORDINALS[lesson.number - 1] ?? lesson.number}: ${shortModuleName(lesson.categoryTitle)}`;
  const statusText = {
    locked: prev ? `Locked. Finish Lesson ${ORDINALS[prev.number - 1] ?? prev.number} first.` : 'Locked',
    done: `Completed · best score ${lesson.best_score ?? 0}%`,
    progress: 'In progress · pick up where you left off',
    open: `Ready to start · +${lesson.xp_reward} XP`,
  }[state];

  const style = { top: top + (g.node - 84) / 2, left: g.boxLeft };
  const inner = (
    <>
      <span className="lesson-box-name">{name}</span>
      <span className="lesson-box-title">{lesson.title}</span>
      <span className={`lesson-box-status status-${state}`}>{statusText}</span>
    </>
  );

  if (state === 'locked') {
    return (
      <div className="lesson-box is-locked" style={style} aria-disabled="true">
        {inner}
      </div>
    );
  }
  return (
    <Link to={`/learn/${lesson.id}`} className={`lesson-box ${state === 'done' ? 'is-done' : ''}`} style={style}>
      {inner}
    </Link>
  );
}

export default function Learn() {
  useTitle('Lessons');
  const compact = useMediaQuery('(max-width: 700px)');
  const g = compact ? COMPACT : FULL;
  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLessons(null);
    try {
      setLessons(flattenCourse(await getCourseMap()));
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell>
      <h1 className="page-title">Lessons</h1>

      {error && (
        <div className="notice notice-error" role="alert">
          <p>We could not load your lessons. {error}</p>
          <button type="button" className="btn btn-cyan btn-small" onClick={load}>Try again</button>
        </div>
      )}

      {!error && !lessons && (
        <div role="status" aria-live="polite">
          <span className="sr-only">Loading lessons</span>
          <Skeleton height={76} width={260} />
          <Skeleton height={76} width={260} className="mt" />
          <Skeleton height={76} width={260} className="mt" />
        </div>
      )}

      {lessons && lessons.length === 0 && (
        <div className="notice">
          <p>No lessons are published yet. Check back soon.</p>
        </div>
      )}

      {lessons && lessons.length > 0 && (
        <>
          <p className="muted path-intro">Finish each lesson to unlock the next one.</p>
          <div className="path" style={{ height: lessons.length * g.rowH + 70 }}>
            <PathLines lessons={lessons} g={g} />
            {lessons.map((lesson, i) => {
              const state = statusOf(lesson);
              const top = i * g.rowH;
              return (
                <div key={lesson.id}>
                  <span className="path-node" style={{ left: g.xs[i % g.xs.length], top }}>
                    <PixelNode
                      size={g.node}
                      color={state === 'locked' ? 'grey' : i % 2 === 0 ? 'pink' : 'cyan'}
                      state={state === 'done' ? 'done' : state === 'locked' ? 'locked' : undefined}
                    >
                      {lesson.number}
                    </PixelNode>
                  </span>
                  <LessonBox lesson={lesson} g={g} top={top} prev={lessons[i - 1]} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </AppShell>
  );
}

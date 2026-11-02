import { CheckIcon, LockIcon } from './Icons.jsx';

// A stepped "pixel circle" used for lesson numbers and the streak counter.
const SHAPE =
  '30,0 70,0 70,10 90,10 90,30 100,30 100,70 90,70 90,90 70,90 70,100 30,100 30,90 10,90 10,70 0,70 0,30 10,30 10,10 30,10';

export default function PixelNode({ children, color = 'pink', size = 72, state, className = '' }) {
  return (
    <span className={`pixel-node pixel-node-${color} ${state ? `is-${state}` : ''} ${className}`} style={{ width: size, height: size, '--s': `${size}px` }}>
      <svg viewBox="0 0 100 100" aria-hidden="true" shapeRendering="crispEdges">
        <polygon points={SHAPE} />
      </svg>
      <span className="pixel-node-label">{children}</span>
      {state === 'done' && (
        <span className="pixel-node-badge" aria-hidden="true"><CheckIcon width={14} height={14} strokeWidth={3.4} /></span>
      )}
      {state === 'locked' && (
        <span className="pixel-node-badge pixel-node-badge-lock" aria-hidden="true"><LockIcon width={14} height={14} strokeWidth={3} /></span>
      )}
    </span>
  );
}

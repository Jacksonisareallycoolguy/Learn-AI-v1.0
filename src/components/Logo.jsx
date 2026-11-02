import { Link } from 'react-router-dom';

const SPARKLE = ['....#....', '....#....', '...###...', '..#####..', '#########', '..#####..', '...###...', '....#....', '....#....'];

export default function Logo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`logo ${className}`} aria-label="Learn AI home">
      <svg viewBox="0 0 9 9" width="18" height="18" aria-hidden="true" shapeRendering="crispEdges" className="logo-star">
        {SPARKLE.flatMap((row, y) =>
          [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null))
        )}
      </svg>
      <span>LEARN AI</span>
    </Link>
  );
}

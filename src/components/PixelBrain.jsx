import { useMemo } from 'react';

// The brain is drawn from a grid of square "pixels" so it stays crisp at any size.
const W = 34;
const H = 28;
const CELL = 2.4;
const OX = 39.2;
const OY = 31.5;

const COLORS = {
  base: '#ff5fa8',
  fold: '#c8327a',
  edge: '#d63c86',
  light: '#ff9fcb',
  spark: '#ffd6e8',
};

function insideBrain(x, y) {
  const cx = x + 0.5;
  const cy = y + 0.5;
  // Two wide, overlapping hemispheres with a flatter top, plus temporal lobes and a cerebellum.
  const left = ((cx - 11.2) / 11.6) ** 2 + ((cy - 11.5) / 9.6) ** 2 <= 1;
  const right = ((cx - 22.8) / 11.6) ** 2 + ((cy - 11.5) / 9.6) ** 2 <= 1;
  const temporalL = ((cx - 9.5) / 7.5) ** 2 + ((cy - 17.5) / 5.2) ** 2 <= 1;
  const temporalR = ((cx - 24.5) / 7.5) ** 2 + ((cy - 17.5) / 5.2) ** 2 <= 1;
  const cerebellum = cy >= 20 && ((cx - 18.5) / 5.6) ** 2 + ((cy - 22.4) / 3.2) ** 2 <= 1;
  const stem = (x === 15 || x === 16) && y >= 22 && y <= 27;
  return left || right || temporalL || temporalR || cerebellum || stem;
}

function hash(x, y) {
  return (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
}

// Wavy ridges (gyri) that run across both hemispheres.
function isFold(x, y) {
  const a = Math.sin(y * 0.72 + Math.sin(x * 0.5) * 1.7);
  const b = Math.sin(x * 0.78 + Math.sin(y * 0.55) * 1.5);
  return Math.abs(a) < 0.17 || Math.abs(b) < 0.13;
}

function buildCells() {
  const byColor = {};
  const add = (color, x, y) =>
    (byColor[color] ||= []).push(`M${(OX + x * CELL).toFixed(2)} ${(OY + y * CELL).toFixed(2)}h${CELL}v${CELL}h-${CELL}z`);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!insideBrain(x, y)) continue;
      let color = COLORS.base;
      if (isFold(x, y)) color = COLORS.fold;
      else if (isFold(x + 1, y + 1) || isFold(x, y + 1)) color = COLORS.light;
      if (!insideBrain(x, y + 1) && color !== COLORS.fold) color = COLORS.edge;
      if ((x === 16 || x === 17) && y < 15) color = COLORS.fold;
      if (color === COLORS.base && hash(x, y) % 29 === 0) color = COLORS.spark;
      add(color, x, y);
    }
  }
  return Object.entries(byColor).map(([color, parts]) => ({ color, d: parts.join('') }));
}

// Each line starts inside the brain, then steps outward in right angles to a node.
const LINES = [
  [[58, 50], [58, 34], [46, 34], [46, 16], [32, 16]],
  [[72, 46], [72, 22], [84, 22], [84, 8]],
  [[108, 48], [108, 30], [124, 30], [124, 14], [140, 14]],
  [[120, 60], [136, 60], [136, 46], [152, 46]],
  [[120, 72], [142, 72], [142, 86], [154, 86]],
  [[112, 86], [124, 86], [124, 104], [140, 104]],
  [[98, 88], [98, 108], [110, 108], [110, 122]],
  [[78, 94], [78, 112], [64, 112], [64, 126]],
  [[54, 82], [40, 82], [40, 100], [22, 100]],
  [[46, 68], [28, 68], [28, 54], [8, 54]],
  [[48, 56], [30, 56], [30, 38], [12, 38]],
];

export default function PixelBrain({ className = '' }) {
  const groups = useMemo(buildCells, []);
  return (
    <svg
      className={`pixel-brain ${className}`}
      viewBox="0 0 160 130"
      role="img"
      aria-label="A pink pixel-art brain with blue neural connections branching out"
      shapeRendering="crispEdges"
    >
      <g fill="none" strokeLinejoin="miter" strokeLinecap="square">
        {LINES.map((pts, i) => {
          const d = pts.map(([x, y], j) => `${j ? 'L' : 'M'}${x} ${y}`).join(' ');
          return (
            <g key={i}>
              <path d={d} stroke="#3fb6d0" strokeWidth="1.6" />
              <path
                d={d}
                className="brain-pulse"
                stroke="#e6fbff"
                strokeWidth="1.6"
                strokeDasharray="4 70"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
            </g>
          );
        })}
      </g>
      {LINES.map((pts, i) => {
        const [x, y] = pts[pts.length - 1];
        return (
          <rect
            key={`n${i}`}
            className="brain-node"
            x={x - 2.2}
            y={y - 2.2}
            width="4.4"
            height="4.4"
            fill="#67e8f9"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        );
      })}
      <g className="brain-body">
        {groups.map((g) => (
          <path key={g.color} d={g.d} fill={g.color} />
        ))}
      </g>
    </svg>
  );
}

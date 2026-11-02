const GRIDS = {
  'first-steps': ['....#....', '....#....', '...###...', '#########', '.#######.', '..#####..', '..##.##..', '.##...##.', '.#.....#.'],
  'ai-explorer': ['....#....', '...###...', '..#####..', '.#######.', '#########', '.#######.', '..#####..', '...###...', '....#....'],
  'perfect-score': ['..#####..', '.#.....#.', '#..###..#', '#.#...#.#', '#.#.#.#.#', '#.#...#.#', '#..###..#', '.#.....#.', '..#####..'],
  consistency: ['....#....', '...##....', '..###.#..', '..#####..', '.#######.', '.#######.', '.#######.', '..#####..', '...###...'],
  'ai-master': ['#...#...#', '##..#..##', '#########', '#########', '.#######.', '.#######.', '.#######.', '.#######.', '.........'],
};

export default function BadgeIcon({ slug, earned = true, size = 48 }) {
  const grid = GRIDS[slug] || GRIDS['first-steps'];
  const color = earned ? (slug === 'consistency' ? '#ff9b3d' : slug === 'ai-explorer' ? '#67e8f9' : '#ff5fa8') : '#4a4e63';
  return (
    <svg viewBox="0 0 9 9" width={size} height={size} aria-hidden="true" shapeRendering="crispEdges">
      {grid.flatMap((row, y) =>
        [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} /> : null))
      )}
    </svg>
  );
}

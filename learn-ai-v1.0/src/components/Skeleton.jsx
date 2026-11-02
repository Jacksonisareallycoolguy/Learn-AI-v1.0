export default function Skeleton({ height = 80, width = '100%', className = '' }) {
  return <div className={`skeleton ${className}`} style={{ height, width }} aria-hidden="true" />;
}

export function PageLoading({ label = 'Loading' }) {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Skeleton height={48} width="40%" />
      <Skeleton height={160} />
      <Skeleton height={160} />
    </div>
  );
}

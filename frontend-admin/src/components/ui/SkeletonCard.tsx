export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line w-60" />
      <div className="skeleton-line w-40" />
      <div className="skeleton-spacer" />
      <div className="skeleton-line w-50" />
      <div className="skeleton-line w-70" />
      <div className="skeleton-line w-30" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

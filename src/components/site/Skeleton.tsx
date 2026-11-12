export function PageSkeleton() {
  return (
    <div className="container section" aria-busy="true" aria-live="polite">
      <div className="skeleton" style={{ height: 36, width: "40%", marginBottom: 24 }} />
      <div className="grid grid-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton" style={{ aspectRatio: "4 / 3" }} />
        ))}
      </div>
    </div>
  );
}

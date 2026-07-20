export default function Loading() {
  return (
    <div className="global-route-loader" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <span className="global-route-loader__bar" aria-hidden="true" />
    </div>
  );
}

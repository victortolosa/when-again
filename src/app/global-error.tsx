'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#000', color: '#fff' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '24rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h1>
            <p style={{ color: '#999', marginBottom: '1.5rem' }}>
              The app ran into an issue. Try reloading to fix it.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => reset()}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #333', background: '#fff', color: '#000', fontWeight: 500, cursor: 'pointer' }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/milestones'}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'transparent', color: '#fff', fontWeight: 500, cursor: 'pointer' }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

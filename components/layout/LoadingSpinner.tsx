'use client';

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}

export function SkeletonBlock({ width, height = 16 }: { width?: number | string; height?: number | string }) {
  return (
    <div
      style={{
        width: width ?? '100%',
        height,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-surface-raised)',
        animation: 'pulse 2s ease-in-out infinite',
      }}
    />
  );
}

export function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
      }}
    >
      <LoadingSpinner size={32} />
    </div>
  );
}

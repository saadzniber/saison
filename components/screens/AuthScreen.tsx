'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { LogoMark } from '@/components/ui/LogoMark';

export default function AuthScreen() {
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signIn();
    } catch {
      setError(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 var(--page-px)',
        background: 'linear-gradient(180deg, var(--color-bg) 0%, var(--color-warm-bg) 100%)',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          maxWidth: 320,
          width: '100%',
        }}
      >
        {/* Logo mark */}
        <div style={{ marginBottom: 4 }}>
          <LogoMark size={64} />
        </div>

        {/* Wordmark */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 48,
            fontWeight: 400,
            color: 'var(--color-ink)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            margin: 0,
          }}
        >
          {t('signin_title')}
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 17,
            color: 'var(--color-ink-muted)',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {t('signin_tagline')}
        </p>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            color: 'var(--color-ink-faint)',
            margin: '8px 0 0',
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          {t('signin_subtitle')}
        </p>

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{
            marginTop: 32,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '14px 24px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border-strong)',
            background: 'var(--color-surface)',
            fontFamily: 'var(--font-ui)',
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--color-ink)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.15s, box-shadow 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          {loading ? (
            <div
              style={{
                width: 18,
                height: 18,
                border: '2px solid var(--color-border)',
                borderTopColor: 'var(--color-accent)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 000 24c0 3.77.87 7.35 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
          )}
          <span>{t('signin_google')}</span>
        </button>

        {/* Error */}
        {error && (
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              color: 'var(--color-error)',
              margin: '8px 0 0',
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Footer */}
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          color: 'var(--color-ink-faint)',
          paddingBottom: 32,
          margin: 0,
          textAlign: 'center',
        }}
      >
        Saison v1.0.0
      </p>
    </div>
  );
}
// named re-export
export { AuthScreen };

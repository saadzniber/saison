'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { createFamily, joinFamily } from '@/services/family';

type Step = 'choice' | 'create' | 'join';

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('choice');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!familyName.trim() || !user) return;
    setLoading(true);
    setError('');
    try {
      await createFamily(familyName.trim(), user.uid, user.name);
      onComplete();
    } catch {
      setError(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim() || !user) return;
    setLoading(true);
    setError('');
    try {
      await joinFamily(inviteCode.trim().toUpperCase(), user.uid, user.name);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: 24,
    borderRadius: 'var(--radius-lg)',
    border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
    background: active ? 'var(--color-accent-bg)' : 'var(--color-surface)',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'border-color 0.15s, background 0.15s',
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    fontFamily: 'var(--font-ui)',
    fontSize: 15,
    color: 'var(--color-ink)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '14px 24px',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    background: disabled ? 'var(--color-border)' : 'var(--color-accent)',
    color: disabled ? 'var(--color-ink-muted)' : '#fff',
    fontFamily: 'var(--font-ui)',
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background 0.15s, opacity 0.15s',
    opacity: loading ? 0.7 : 1,
  });

  const stepCount = step === 'choice' ? 1 : 2;
  const totalSteps = 2;

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--page-px)',
        background: 'var(--color-bg)',
      }}
    >
      {/* Progress dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          paddingTop: 24,
          paddingBottom: 16,
        }}
      >
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            style={{
              width: i + 1 <= stepCount ? 24 : 8,
              height: 8,
              borderRadius: 'var(--radius-full)',
              background: i + 1 <= stepCount ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'width 0.2s, background 0.2s',
            }}
          />
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400, width: '100%', margin: '0 auto' }}>
        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 400,
            color: 'var(--color-ink)',
            textAlign: 'center',
            margin: '0 0 32px',
          }}
        >
          {t('onboarding_welcome')}
        </h1>

        {/* Step: Choice */}
        {step === 'choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={cardStyle(false)} onClick={() => setStep('create')}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--color-ink)',
                    margin: 0,
                  }}
                >
                  {t('onboarding_create_family')}
                </p>
              </div>

              <div style={cardStyle(false)} onClick={() => setStep('join')}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔗</div>
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--color-ink)',
                    margin: 0,
                  }}
                >
                  {t('onboarding_join_family')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step: Create Family */}
        {step === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button
              onClick={() => { setStep('choice'); setError(''); }}
              style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                color: 'var(--color-ink-muted)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
              </svg>
              {t('back')}
            </button>

            <div
              style={{
                padding: 24,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <label
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--color-ink-muted)',
                }}
              >
                {t('onboarding_family_name')}
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="The Smiths"
                autoFocus
                style={inputStyle}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <button
                onClick={handleCreate}
                disabled={!familyName.trim() || loading}
                style={btnStyle(!familyName.trim() || loading)}
              >
                {loading && (
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                )}
                {t('onboarding_create_btn')}
              </button>
            </div>

            {error && (
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  color: 'var(--color-error)',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}
          </div>
        )}

        {/* Step: Join Family */}
        {step === 'join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button
              onClick={() => { setStep('choice'); setError(''); }}
              style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                color: 'var(--color-ink-muted)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
              </svg>
              {t('back')}
            </button>

            <div
              style={{
                padding: 24,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <label
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--color-ink-muted)',
                }}
              >
                {t('onboarding_invite_code')}
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                autoFocus
                maxLength={6}
                style={{
                  ...inputStyle,
                  textAlign: 'center',
                  letterSpacing: '0.2em',
                  fontSize: 20,
                  fontWeight: 600,
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              <button
                onClick={handleJoin}
                disabled={!inviteCode.trim() || loading}
                style={btnStyle(!inviteCode.trim() || loading)}
              >
                {loading && (
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                )}
                {t('onboarding_join_btn')}
              </button>
            </div>

            {error && (
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  color: 'var(--color-error)',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { OnboardingScreen };

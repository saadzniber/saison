'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import {
  getUserFamily,
  getFamilyMembers,
  generateInviteCode,
  leaveFamily,
} from '@/services/family';
import type { Family, User } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Small reusable helpers                                                      */
/* -------------------------------------------------------------------------- */

function initials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.charAt(0).toUpperCase();
}

function Avatar({ photoUrl, name, size = 44 }: { photoUrl?: string; name: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--color-accent-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-ui)',
        fontSize: size * 0.38,
        fontWeight: 600,
        color: 'var(--color-accent)',
        flexShrink: 0,
        overflow: 'hidden',
        border: '1.5px solid var(--color-border)',
      }}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials(name || '?')
      )}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 18,
        fontWeight: 400,
        color: 'var(--color-ink)',
        margin: '0 0 10px',
      }}
    >
      {children}
    </h2>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--color-border)', margin: '16px 0' }} />;
}

function Spinner({ color = 'var(--color-accent)', size = 16 }: { color?: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Confirmation modal                                                          */
/* -------------------------------------------------------------------------- */

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  danger = false,
  confirmLabel,
  cancelLabel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  confirmLabel: string;
  cancelLabel: string;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 200,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 28,
          maxWidth: 360,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 15,
            color: 'var(--color-ink)',
            margin: 0,
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-ink-muted)',
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: danger ? 'var(--color-error)' : 'var(--color-accent)',
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main screen                                                                 */
/* -------------------------------------------------------------------------- */

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { t, locale, setLocale } = useTranslation();

  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(true);

  const [copied, setCopied] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);

  const [leavingFamily, setLeavingFamily] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  /* Load family data */
  const loadFamily = useCallback(async () => {
    if (!user?.uid) {
      setLoadingFamily(false);
      return;
    }
    setLoadingFamily(true);
    try {
      const fam = await getUserFamily(user.uid);
      setFamily(fam);
      if (fam) {
        const m = await getFamilyMembers(fam.id);
        setMembers(m);
      }
    } catch {
      /* silently fail */
    } finally {
      setLoadingFamily(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  /* Copy invite code — regenerate fresh code each time */
  const handleCopyInvite = async () => {
    if (!family || !user || generatingInvite) return;
    setGeneratingInvite(true);
    try {
      const code = await generateInviteCode(family.id, user.uid);
      await navigator.clipboard.writeText(code);
      setFamily((prev) => (prev ? { ...prev, inviteCode: code } : prev));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard or network failure — ignore silently */
    } finally {
      setGeneratingInvite(false);
    }
  };

  /* Leave family (confirmed via modal) */
  const handleLeaveFamily = async () => {
    if (!family || !user) return;
    setShowLeaveConfirm(false);
    setLeavingFamily(true);
    try {
      await leaveFamily(family.id, user.uid);
      setFamily(null);
      setMembers([]);
    } catch {
      /* silently fail */
    } finally {
      setLeavingFamily(false);
    }
  };

  /* Sign out (confirmed via modal) */
  const handleSignOut = async () => {
    setShowSignOutConfirm(false);
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <>
      <div className="page-content" style={{ maxWidth: 430, margin: '0 auto' }}>
        {/* Page title */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 400,
            color: 'var(--color-ink)',
            margin: '0 0 24px',
          }}
        >
          {t('settings_title')}
        </h1>

        {/* ── Profile ─────────────────────────────────── */}
        <section style={{ marginBottom: 20 }}>
          <SectionHeader>{t('settings_profile')}</SectionHeader>
          <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar photoUrl={user?.photoUrl} name={user?.name ?? ''} size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  margin: 0,
                }}
              >
                {user?.name ?? '—'}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  color: 'var(--color-ink-muted)',
                  margin: '2px 0 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.email ?? ''}
              </p>
            </div>
          </Card>
        </section>

        {/* ── Family ─────────────────────────────────── */}
        <section style={{ marginBottom: 20 }}>
          <SectionHeader>{t('settings_family')}</SectionHeader>
          <Card>
            {loadingFamily ? (
              /* Skeleton */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[70, 45, 55].map((w, i) => (
                  <div
                    key={i}
                    className="animate-pulse"
                    style={{
                      width: `${w}%`,
                      height: 14,
                      borderRadius: 4,
                      background: 'var(--color-surface-raised)',
                    }}
                  />
                ))}
              </div>
            ) : family ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Family name + member count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-accent-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {/* house SVG */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12L12 3l9 9" />
                      <path d="M9 21V12h6v9" />
                      <rect x="3" y="12" width="18" height="9" rx="1" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                      {family.name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-muted)', margin: '2px 0 0' }}>
                      {members.length} {t('settings_members').toLowerCase()}
                    </p>
                  </div>
                </div>

                <Divider />

                {/* Members list */}
                <div style={{ marginBottom: 16 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: 'var(--color-ink-faint)',
                      margin: '0 0 10px',
                    }}
                  >
                    {t('settings_members')}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {members.map((m) => (
                      <div key={m.uid} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar photoUrl={m.photoUrl} name={m.name || '?'} size={34} />
                        <span
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: 14,
                            color: 'var(--color-ink)',
                            flex: 1,
                          }}
                        >
                          {m.name}
                        </span>
                        {m.uid === family.adminId && (
                          <span
                            style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: 11,
                              fontWeight: 500,
                              color: 'var(--color-accent)',
                              background: 'var(--color-accent-bg)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                            }}
                          >
                            Admin
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* Invite code section */}
                <div style={{ marginBottom: 16 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: 'var(--color-ink-faint)',
                      margin: '0 0 10px',
                    }}
                  >
                    {t('settings_invite')}
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface-raised)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: 17,
                        fontWeight: 700,
                        color: 'var(--color-ink)',
                        letterSpacing: '0.18em',
                        textAlign: 'center',
                      }}
                    >
                      {family.inviteCode}
                    </div>
                    <button
                      onClick={handleCopyInvite}
                      disabled={generatingInvite}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        background: copied ? 'var(--color-accent-bg)' : 'var(--color-surface)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: 13,
                        fontWeight: 500,
                        color: copied ? 'var(--color-accent)' : 'var(--color-ink-muted)',
                        cursor: generatingInvite ? 'wait' : 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexShrink: 0,
                      }}
                    >
                      {generatingInvite ? (
                        <Spinner color="var(--color-ink-muted)" size={13} />
                      ) : copied ? (
                        /* checkmark SVG */
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        /* copy SVG */
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                      {copied ? 'Copied!' : t('settings_invite_copy')}
                    </button>
                  </div>
                </div>

                {/* Leave family */}
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  disabled={leavingFamily}
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-error)',
                    background: 'transparent',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--color-error)',
                    cursor: leavingFamily ? 'not-allowed' : 'pointer',
                    opacity: leavingFamily ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'opacity 0.15s',
                  }}
                >
                  {leavingFamily && <Spinner color="var(--color-error)" size={14} />}
                  {t('settings_leave_family')}
                </button>
              </div>
            ) : (
              /* No family state */
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 14,
                    color: 'var(--color-ink-muted)',
                    margin: '0 0 14px',
                  }}
                >
                  You are not part of a family yet.
                </p>
                <button
                  onClick={() => { window.location.href = '/'; }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--color-accent)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Create or Join a Family
                </button>
              </div>
            )}
          </Card>
        </section>

        {/* ── Language ─────────────────────────────────── */}
        <section style={{ marginBottom: 20 }}>
          <SectionHeader>{t('settings_language')}</SectionHeader>
          <Card style={{ display: 'flex', gap: 8 }}>
            {(['en', 'fr'] as const).map((lang) => {
              const active = locale === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setLocale(lang)}
                  style={{
                    flex: 1,
                    padding: '11px 0',
                    borderRadius: 'var(--radius-full)',
                    border: active
                      ? '1.5px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                    background: active ? 'var(--color-accent-bg)' : 'var(--color-surface)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--color-accent)' : 'var(--color-ink-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {t(`settings_${lang}`)}
                </button>
              );
            })}
          </Card>
        </section>

        {/* ── Sign Out ─────────────────────────────────── */}
        <section style={{ marginBottom: 32 }}>
          <button
            onClick={() => setShowSignOutConfirm(true)}
            disabled={signingOut}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontFamily: 'var(--font-ui)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--color-error)',
              cursor: signingOut ? 'not-allowed' : 'pointer',
              opacity: signingOut ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'opacity 0.15s',
            }}
          >
            {signingOut ? (
              <Spinner color="var(--color-error)" size={16} />
            ) : (
              /* logout SVG */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            )}
            {t('settings_signout')}
          </button>
        </section>

        {/* ── Version ─────────────────────────────────── */}
        <section style={{ textAlign: 'center', paddingBottom: 8 }}>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              color: 'var(--color-ink-faint)',
              margin: 0,
              letterSpacing: '0.02em',
            }}
          >
            Saison 1.0.0
          </p>
        </section>
      </div>

      {/* Modals */}
      {showLeaveConfirm && (
        <ConfirmModal
          message={t('settings_leave_confirm')}
          danger
          confirmLabel={t('settings_leave_family')}
          cancelLabel={t('cancel')}
          onConfirm={handleLeaveFamily}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}
      {showSignOutConfirm && (
        <ConfirmModal
          message={t('settings_signout_confirm')}
          danger
          confirmLabel={t('settings_signout')}
          cancelLabel={t('cancel')}
          onConfirm={handleSignOut}
          onCancel={() => setShowSignOutConfirm(false)}
        />
      )}
    </>
  );
}
// named re-export
export { SettingsScreen };

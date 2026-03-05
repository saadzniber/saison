'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { fetchWeeklyDiversity } from '@/services/diversity';
import { fetchActivity } from '@/services/activity';
import { getWeekCalendar } from '@/services/calendar';
import { getWeekId, getWeekDates, MEAL_TYPES } from '@/types';
import type { WeeklyDiversity, ActivityItem, CalendarEntry, MealType } from '@/types';
import { SkeletonBlock } from '@/components/layout/LoadingSpinner';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function getGreeting(timeOfDay: string, t: (key: string) => string): string {
  switch (timeOfDay) {
    case 'morning':
      return t('greeting_morning');
    case 'afternoon':
      return t('greeting_afternoon');
    default:
      return t('greeting_evening');
  }
}

function getCurrentSeason(t: (key: string) => string): { label: string; emoji: string } {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return { label: t('season_spring'), emoji: '\u{1F331}' };
  if (month >= 6 && month <= 8) return { label: t('season_summer'), emoji: '\u{2600}\u{FE0F}' };
  if (month >= 9 && month <= 11) return { label: t('season_autumn'), emoji: '\u{1F342}' };
  return { label: t('season_winter'), emoji: '\u{2744}\u{FE0F}' };
}

function getCurrentMealType(): MealType {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  return 'dinner';
}

function getActivityLabel(
  item: ActivityItem,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  switch (item.type) {
    case 'recipe_created':
      return t('activity_recipe_created', { name: item.payload.recipeName || '' });
    case 'recipe_saved':
      return t('activity_recipe_saved', { name: item.payload.recipeName || '' });
    case 'calendar_added':
      return t('activity_calendar_added', {
        meal: item.payload.mealType || '',
        name: item.payload.recipeName || '',
      });
    case 'grocery_added':
      return t('activity_grocery_added');
    case 'member_joined':
      return t('activity_member_joined');
    default:
      return '';
  }
}

function getTimeAgoText(
  date: Date,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return t('time_just_now');
  if (diffMin < 60) return t('time_minutes_ago', { n: diffMin });
  if (diffHour < 24) return t('time_hours_ago', { n: diffHour });
  if (diffDay < 2) return t('time_yesterday');
  return t('time_days_ago', { n: diffDay });
}

const stagger = (i: number): React.CSSProperties => ({
  opacity: 0,
  animation: `fadeIn 0.45s ease-out ${i * 0.08}s forwards`,
});

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: 'var(--color-warm)',
  lunch: 'var(--color-accent)',
  dinner: 'var(--color-accent-light)',
};

const MEAL_GLOW: Record<MealType, string> = {
  breakfast: 'rgba(212,168,67,0.25)',
  lunch: 'rgba(45,80,22,0.25)',
  dinner: 'rgba(74,122,37,0.25)',
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const [diversity, setDiversity] = useState<WeeklyDiversity | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [upcoming, setUpcoming] = useState<CalendarEntry[]>([]);
  const [loadingDiversity, setLoadingDiversity] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const familyId = user?.familyId;
  const weekId = getWeekId();

  const loadData = useCallback(async () => {
    if (!familyId) return;

    fetchWeeklyDiversity(familyId, weekId)
      .then((d) => setDiversity(d))
      .catch(() => {})
      .finally(() => setLoadingDiversity(false));

    fetchActivity(familyId, 10)
      .then((a) => setActivity(a))
      .catch(() => {})
      .finally(() => setLoadingActivity(false));

    const weekDates = getWeekDates();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayIdx = weekDates.findIndex((d) => d.date === todayStr);
    const upcomingDates = weekDates
      .slice(Math.max(0, todayIdx), Math.max(0, todayIdx) + 3)
      .map((d) => d.date);

    if (upcomingDates.length > 0) {
      getWeekCalendar(familyId, upcomingDates)
        .then((entries) => {
          entries.sort(
            (a, b) =>
              a.date.localeCompare(b.date) || a.mealType.localeCompare(b.mealType)
          );
          setUpcoming(entries);
        })
        .catch(() => {})
        .finally(() => setLoadingCalendar(false));
    } else {
      setLoadingCalendar(false);
    }
  }, [familyId, weekId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Computed
  const firstName = user?.name?.split(' ')[0] || '';
  const timeOfDay = getTimeOfDay();
  const season = getCurrentSeason(t);
  const currentMealType = getCurrentMealType();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const todayEntries = upcoming.filter((e) => e.date === todayStr);
  const tomorrowEntries = upcoming.filter((e) => e.date === tomorrowStr);

  const plantCount = diversity ? Object.keys(diversity.produce).length : 0;
  const progress = Math.min(plantCount / 30, 1);
  const plantNames = diversity ? Object.keys(diversity.produce) : [];

  const formattedDate = new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      style={{
        padding: 'var(--page-px)',
        paddingBottom: 'calc(var(--nav-height) + 24px)',
      }}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Greeting                                                          */}
      {/* ----------------------------------------------------------------- */}
      <div style={{ ...stagger(0), marginBottom: 28, marginTop: 12 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 400,
            color: 'var(--color-ink)',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {getGreeting(timeOfDay, t)}, {firstName}
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 6,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              color: 'var(--color-ink-muted)',
            }}
          >
            {formattedDate}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--color-accent)',
              background: 'var(--color-accent-bg)',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {season.emoji} {season.label}
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Today's Meals                                                     */}
      {/* ----------------------------------------------------------------- */}
      <section style={{ ...stagger(1), marginBottom: 20 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 400,
            color: 'var(--color-ink)',
            margin: '0 0 10px',
          }}
        >
          {t('home_todays_meals')}
        </h2>

        {loadingCalendar ? (
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  padding: '14px 16px',
                  borderBottom:
                    i < 2 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <SkeletonBlock height={14} width="35%" />
                <div style={{ marginTop: 6 }}>
                  <SkeletonBlock height={18} width="60%" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}
          >
            {MEAL_TYPES.map((mealType, i) => {
              const entry = todayEntries.find(
                (e) => e.mealType === mealType
              );
              const isCurrent = mealType === currentMealType;
              const isLast = i === MEAL_TYPES.length - 1;

              return (
                <div
                  key={mealType}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '14px 16px',
                    borderBottom: isLast
                      ? 'none'
                      : '1px solid var(--color-border)',
                    background: isCurrent
                      ? 'var(--color-surface-raised)'
                      : 'transparent',
                  }}
                >
                  {/* Meal dot */}
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: MEAL_COLORS[mealType],
                      marginTop: 5,
                      flexShrink: 0,
                      boxShadow: isCurrent
                        ? `0 0 0 3px ${MEAL_GLOW[mealType]}`
                        : 'none',
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Meal type label */}
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--color-ink-faint)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0,
                      }}
                    >
                      {t(`mealType_${mealType}`)}
                    </p>

                    {/* Recipe name or plan CTA */}
                    {entry ? (
                      <Link
                        href={`/recipes?id=${entry.recipeId}`}
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 16,
                          fontWeight: 400,
                          color: 'var(--color-ink)',
                          textDecoration: 'none',
                          display: 'block',
                          marginTop: 2,
                          lineHeight: 1.3,
                        }}
                      >
                        {entry.recipeName}
                      </Link>
                    ) : (
                      <Link
                        href="/calendar"
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: 14,
                          color: 'var(--color-ink-faint)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 3,
                        }}
                      >
                        <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                        {t('home_plan_meal')}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Plant Diversity                                                   */}
      {/* ----------------------------------------------------------------- */}
      <section style={{ ...stagger(2), marginBottom: 20 }}>
        <div
          onClick={() => setShowModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setShowModal(true);
          }}
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '16px 20px',
            cursor: 'pointer',
          }}
        >
          {loadingDiversity ? (
            <div>
              <SkeletonBlock height={16} width="50%" />
              <div style={{ marginTop: 10 }}>
                <SkeletonBlock height={6} />
              </div>
            </div>
          ) : (
            <>
              {/* Header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{'\u{1F331}'}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--color-ink-muted)',
                    }}
                  >
                    {t('home_plants_week', { n: plantCount })}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 22,
                      color: 'var(--color-accent)',
                    }}
                  >
                    {plantCount}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 13,
                      color: 'var(--color-ink-faint)',
                    }}
                  >
                    / 30
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: 'var(--color-accent-bg)',
                  overflow: 'hidden',
                  marginBottom: plantNames.length > 0 ? 12 : 0,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress * 100}%`,
                    borderRadius: 3,
                    background: 'var(--color-accent)',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>

              {/* Plant name pills */}
              {plantNames.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 4,
                  }}
                >
                  {plantNames.slice(0, 8).map((name) => (
                    <span
                      key={name}
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 11,
                        color: 'var(--color-accent)',
                        background: 'var(--color-accent-bg)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {name}
                    </span>
                  ))}
                  {plantNames.length > 8 && (
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 11,
                        color: 'var(--color-ink-faint)',
                        padding: '2px 4px',
                      }}
                    >
                      +{plantNames.length - 8}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Tomorrow Preview                                                  */}
      {/* ----------------------------------------------------------------- */}
      {!loadingCalendar && tomorrowEntries.length > 0 && (
        <section style={{ ...stagger(3), marginBottom: 20 }}>
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '14px 16px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-ink-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 8px',
              }}
            >
              {t('home_tomorrow_preview')}
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {tomorrowEntries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: MEAL_COLORS[entry.mealType],
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 14,
                      color: 'var(--color-ink)',
                    }}
                  >
                    <span style={{ color: 'var(--color-ink-muted)' }}>
                      {t(`mealType_${entry.mealType}`)}:
                    </span>{' '}
                    {entry.recipeName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Family Activity                                                   */}
      {/* ----------------------------------------------------------------- */}
      {loadingActivity ? (
        <section style={{ ...stagger(3), marginBottom: 20 }}>
          <SkeletonBlock height={16} width="40%" />
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <SkeletonBlock height={40} />
            <SkeletonBlock height={40} />
            <SkeletonBlock height={40} />
          </div>
        </section>
      ) : (
        activity.length > 0 && (
          <section
            style={{
              ...stagger(tomorrowEntries.length > 0 ? 4 : 3),
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 400,
                color: 'var(--color-ink)',
                margin: '0 0 14px',
              }}
            >
              {t('home_activity')}
            </h2>

            <div style={{ paddingLeft: 6 }}>
              {activity.slice(0, 5).map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    borderLeft: '2px solid var(--color-border)',
                    paddingLeft: 16,
                    paddingBottom:
                      i < Math.min(activity.length - 1, 4) ? 16 : 0,
                    position: 'relative',
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -5,
                      top: 4,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--color-surface)',
                      border: '2px solid var(--color-border)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 14,
                        color: 'var(--color-ink)',
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      <strong>
                        {item.userName.split(' ')[0]}
                      </strong>{' '}
                      {getActivityLabel(item, t)}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 12,
                        color: 'var(--color-ink-faint)',
                        margin: '2px 0 0',
                      }}
                    >
                      {getTimeAgoText(item.createdAt, t)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 30 Plants Modal                                                   */}
      {/* ----------------------------------------------------------------- */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              padding: '32px var(--page-px) 48px',
              maxHeight: '80dvh',
              overflowY: 'auto',
            }}
          >
            {/* Close */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: 8,
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                  color: 'var(--color-ink-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                {t('close')}
              </button>
            </div>

            {/* Icon */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div
                style={{
                  display: 'inline-flex',
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--color-accent-bg)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}
              >
                {'\u{1F331}'}
              </div>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                fontWeight: 400,
                color: 'var(--color-ink)',
                textAlign: 'center',
                margin: '0 0 16px',
              }}
            >
              {t('home_plants_challenge_title')}
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 15,
                color: 'var(--color-ink-muted)',
                lineHeight: 1.6,
                textAlign: 'center',
                margin: 0,
              }}
            >
              {t('home_plants_challenge_body')}
            </p>

            {/* Current progress */}
            <div
              style={{
                marginTop: 24,
                padding: 16,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent-bg)',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  color: 'var(--color-accent)',
                  margin: 0,
                }}
              >
                {plantCount} / 30
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  color: 'var(--color-accent)',
                  margin: '4px 0 0',
                }}
              >
                {t('home_plants_week', { n: plantCount })}
              </p>
            </div>

            {/* Plant names in modal */}
            {plantNames.length > 0 && (
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  justifyContent: 'center',
                }}
              >
                {plantNames.map((name) => (
                  <span
                    key={name}
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 13,
                      color: 'var(--color-accent)',
                      background: 'var(--color-accent-bg)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
// named re-export
export { HomeScreen };

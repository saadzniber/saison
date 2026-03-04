'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { fetchWeeklyDiversity } from '@/services/diversity';
import { fetchActivity } from '@/services/activity';
import { getWeekCalendar } from '@/services/calendar';
import { getWeekId, getWeekDates } from '@/types';
import type { WeeklyDiversity, ActivityItem, CalendarEntry } from '@/types';
import { SkeletonBlock } from '@/components/layout/LoadingSpinner';

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function getGreetingKey(timeOfDay: string): string {
  // The i18n key is home_greeting with {name} param; we handle time of day separately
  return timeOfDay === 'morning'
    ? 'Good morning'
    : timeOfDay === 'afternoon'
      ? 'Good afternoon'
      : 'Good evening';
}

function getTimeAgoText(date: Date, t: (key: string, params?: Record<string, string | number>) => string): string {
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

function getActivityLabel(item: ActivityItem): string {
  switch (item.type) {
    case 'recipe_created':
      return `created "${item.payload.recipeName}"`;
    case 'recipe_saved':
      return `saved "${item.payload.recipeName}"`;
    case 'calendar_added':
      return `planned ${item.payload.mealType}: "${item.payload.recipeName}"`;
    case 'grocery_added':
      return `added items to grocery list`;
    case 'member_joined':
      return `joined the family`;
    default:
      return '';
  }
}

// SVG ring constants
const RING_SIZE = 160;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
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

    // Fetch diversity
    fetchWeeklyDiversity(familyId, weekId)
      .then((d) => setDiversity(d))
      .catch(() => {})
      .finally(() => setLoadingDiversity(false));

    // Fetch activity
    fetchActivity(familyId, 10)
      .then((a) => setActivity(a))
      .catch(() => {})
      .finally(() => setLoadingActivity(false));

    // Fetch upcoming calendar (today + next 2 days)
    const weekDates = getWeekDates();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayIdx = weekDates.findIndex((d) => d.date === todayStr);
    const upcomingDates = weekDates.slice(
      Math.max(0, todayIdx),
      Math.max(0, todayIdx) + 3
    ).map((d) => d.date);

    if (upcomingDates.length > 0) {
      getWeekCalendar(familyId, upcomingDates)
        .then((entries) => {
          entries.sort((a, b) => a.date.localeCompare(b.date) || a.mealType.localeCompare(b.mealType));
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

  const plantCount = diversity ? Object.keys(diversity.produce).length : 0;
  const progress = Math.min(plantCount / 30, 1);
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
  const firstName = user?.name?.split(' ')[0] || '';
  const timeOfDay = getTimeOfDay();

  return (
    <div style={{ padding: 'var(--page-px)', paddingBottom: 'calc(var(--nav-height) + 24px)' }}>
      {/* Greeting */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 400,
          color: 'var(--color-ink)',
          margin: '24px 0 24px',
          lineHeight: 1.2,
        }}
      >
        {getGreetingKey(timeOfDay)}, {firstName}!
      </h1>

      {/* Diversity Ring */}
      <div
        onClick={() => setShowModal(true)}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Info button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-ink-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ?
        </button>

        {loadingDiversity ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 20 }}>
            <SkeletonBlock width={RING_SIZE} height={RING_SIZE} />
            <SkeletonBlock width={120} height={16} />
          </div>
        ) : (
          <>
            <svg width={RING_SIZE} height={RING_SIZE}>
              {/* Background ring */}
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="var(--color-surface-raised)"
                strokeWidth={RING_STROKE}
              />
              {/* Progress ring */}
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              {/* Center text */}
              <text
                x={RING_SIZE / 2}
                y={RING_SIZE / 2 - 6}
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 32,
                  fontWeight: 400,
                  fill: 'var(--color-ink)',
                }}
              >
                {plantCount}
              </text>
              <text
                x={RING_SIZE / 2}
                y={RING_SIZE / 2 + 16}
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12,
                  fill: 'var(--color-ink-muted)',
                }}
              >
                / 30
              </text>
            </svg>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                color: 'var(--color-ink-muted)',
                margin: 0,
              }}
            >
              plants this week
            </p>
          </>
        )}
      </div>

      {/* This Week at a Glance */}
      <section style={{ marginTop: 24 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 400,
            color: 'var(--color-ink)',
            margin: '0 0 12px',
          }}
        >
          {t('home_this_week')}
        </h2>

        {loadingCalendar ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBlock height={48} />
            <SkeletonBlock height={48} />
          </div>
        ) : upcoming.length === 0 ? (
          <div
            style={{
              padding: 20,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                color: 'var(--color-ink-muted)',
                margin: 0,
              }}
            >
              {t('calendar_empty')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcoming.slice(0, 4).map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background:
                      entry.mealType === 'breakfast'
                        ? 'var(--color-warm)'
                        : entry.mealType === 'lunch'
                          ? 'var(--color-accent)'
                          : 'var(--color-accent-light)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--color-ink)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.recipeName}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 12,
                      color: 'var(--color-ink-faint)',
                      margin: 0,
                    }}
                  >
                    {t(`mealType_${entry.mealType}`)} &middot; {entry.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Family Activity */}
      <section style={{ marginTop: 24 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 400,
            color: 'var(--color-ink)',
            margin: '0 0 12px',
          }}
        >
          {t('home_activity')}
        </h2>

        {loadingActivity ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBlock height={52} />
            <SkeletonBlock height={52} />
            <SkeletonBlock height={52} />
          </div>
        ) : activity.length === 0 ? (
          <div
            style={{
              padding: 20,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                color: 'var(--color-ink-muted)',
                margin: 0,
              }}
            >
              {t('home_no_activity')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activity.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--color-accent-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-accent)',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {item.userPhoto ? (
                    <img
                      src={item.userPhoto}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    item.userName.charAt(0).toUpperCase()
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 14,
                      color: 'var(--color-ink)',
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    <strong>{item.userName.split(' ')[0]}</strong>{' '}
                    {getActivityLabel(item)}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 12,
                      color: 'var(--color-ink-faint)',
                      margin: 0,
                    }}
                  >
                    {getTimeAgoText(item.createdAt, t)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 30 Plants Modal */}
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
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

            {/* Challenge icon */}
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
                🌱
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
                plants this week
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// named re-export
export { HomeScreen };

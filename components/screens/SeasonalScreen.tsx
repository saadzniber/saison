'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { fetchProduceBySeason, PRODUCE_CATALOGUE } from '@/services/produce';
import { getProduceName } from '@/types';
import type { Produce, Season } from '@/types';

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

const SEASON_GRADIENTS: Record<Season, string> = {
  spring: 'linear-gradient(135deg, #d4f0c4 0%, #a8e6a3 40%, #c8f0a0 100%)',
  summer: 'linear-gradient(135deg, #fff4b8 0%, #ffe082 40%, #ffca28 100%)',
  autumn: 'linear-gradient(135deg, #ffd4a8 0%, #ffab76 40%, #e07040 100%)',
  winter: 'linear-gradient(135deg, #d4e8f8 0%, #b0ccee 40%, #8eb8e4 100%)',
};

const SEASON_ACCENT: Record<Season, string> = {
  spring: '#2e7d32',
  summer: '#e65100',
  autumn: '#bf360c',
  winter: '#1565c0',
};

const SEASON_ICON: Record<Season, string> = {
  spring: '🌿',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
};

const TYPE_ORDER: Produce['type'][] = ['vegetable', 'fruit', 'herb', 'grain', 'legume', 'nut'];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  vegetable: { bg: '#e8f5e9', text: '#2e7d32' },
  fruit:     { bg: '#fff3e0', text: '#e65100' },
  herb:      { bg: '#f1f8e9', text: '#558b2f' },
  grain:     { bg: '#efebe9', text: '#5d4037' },
  legume:    { bg: '#fce4ec', text: '#880e4f' },
  nut:       { bg: '#fff8e1', text: '#f57f17' },
};

export default function SeasonalScreen() {
  const { t, locale } = useTranslation();
  const [season, setSeason] = useState<Season>(getCurrentSeason());
  const [produce, setProduce] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProduceBySeason(season)
      .then(setProduce)
      .finally(() => setLoading(false));
  }, [season]);

  const grouped = TYPE_ORDER.reduce<Record<string, Produce[]>>((acc, type) => {
    const items = produce.filter((p) => p.type === type);
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {});

  const accentColor = SEASON_ACCENT[season];

  return (
    <div className="page-content" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Page title */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 400,
          color: 'var(--color-ink)',
          margin: '0 0 20px',
        }}
      >
        {t('seasonal_title')}
      </h1>

      {/* Season header banner */}
      <div
        style={{
          borderRadius: 'var(--radius-xl)',
          background: SEASON_GRADIENTS[season],
          padding: '20px 24px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          transition: 'background 0.4s ease',
        }}
      >
        <span style={{ fontSize: 40, lineHeight: 1 }}>{SEASON_ICON[season]}</span>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 500,
              color: accentColor,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {t(`seasonal_${season}`)}
          </p>
          {!loading && (
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                color: accentColor,
                opacity: 0.7,
                margin: '4px 0 0',
              }}
            >
              {t('seasonal_items', { n: produce.length })}
            </p>
          )}
        </div>
      </div>

      {/* Season tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 24,
        }}
      >
        {SEASONS.map((s) => {
          const active = season === s;
          return (
            <button
              key={s}
              onClick={() => setSeason(s)}
              style={{
                flex: 1,
                padding: '8px 0',
                fontSize: 12,
                fontFamily: 'var(--font-ui)',
                fontWeight: active ? 600 : 400,
                borderRadius: 'var(--radius-full)',
                border: active
                  ? `1.5px solid ${SEASON_ACCENT[s]}`
                  : '1px solid var(--color-border)',
                background: active ? SEASON_ACCENT[s] : 'var(--color-surface)',
                color: active ? '#fff' : 'var(--color-ink-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {t(`seasonal_${s}`)}
            </button>
          );
        })}
      </div>

      {/* Produce grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[1, 2, 3].map((g) => (
            <div key={g}>
              <div
                className="animate-pulse"
                style={{
                  width: 80,
                  height: 14,
                  borderRadius: 4,
                  background: 'var(--color-surface-raised)',
                  marginBottom: 10,
                }}
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse"
                    style={{
                      height: 80,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface-raised)',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : produce.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--color-ink-faint)',
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
          }}
        >
          {t('seasonal_empty')}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {Object.entries(grouped).map(([type, items]) => {
            const colors = TYPE_COLORS[type] ?? { bg: '#f5f5f5', text: '#555' };
            return (
              <div key={type}>
                {/* Section label */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: colors.text,
                      background: colors.bg,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {t(`produce_${type}`)}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 12,
                      color: 'var(--color-ink-faint)',
                    }}
                  >
                    {items.length}
                  </span>
                </div>

                {/* Chips grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                  }}
                >
                  {items.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '14px 8px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ fontSize: 26, lineHeight: 1 }}>{p.emoji}</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: 12,
                          fontWeight: 500,
                          color: 'var(--color-ink)',
                          lineHeight: 1.25,
                          wordBreak: 'break-word',
                        }}
                      >
                        {getProduceName(p, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// named re-export
export { SeasonalScreen };

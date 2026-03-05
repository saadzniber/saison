'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { listenToWeekCalendar, addToCalendar, removeFromCalendar, fetchAllCalendarEntries } from '@/services/calendar';
import { fetchFamilyRecipes, fetchCommunityRecipes, getStarredIds, fetchRecipesByIds } from '@/services/recipes';
import { logActivity } from '@/services/activity';
import { logMealProduce, recalculateWeekDiversity } from '@/services/diversity';
import type { CalendarEntry, Recipe, MealType } from '@/types';
import { MEAL_TYPES, getWeekDates, getWeekId } from '@/types';
import { SkeletonBlock } from '@/components/layout/LoadingSpinner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PopoverState {
  entry: CalendarEntry;
  anchorRect: DOMRect;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('default', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NoFamilyState({ t }: { t: (key: string) => string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingTop: 80,
        textAlign: 'center',
      }}
    >
      {/* Illustration */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect width="64" height="64" rx="32" fill="var(--color-accent-bg)" />
        <path
          d="M20 22h24v22H20V22zm0 6h24M28 22v6M36 22v6"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="38" r="4" fill="var(--color-accent)" opacity="0.3" />
      </svg>
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 15,
          color: 'var(--color-ink-muted)',
          maxWidth: 240,
          lineHeight: 1.5,
        }}
      >
        Join a family first to use the meal calendar.
      </p>
      <Link
        href="/settings"
        style={{
          padding: '10px 20px',
          background: 'var(--color-accent)',
          color: '#fff',
          borderRadius: 'var(--radius-full)',
          fontFamily: 'var(--font-ui)',
          fontSize: 14,
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        Go to Settings
      </Link>
    </div>
  );
}

interface MealPopoverProps {
  entry: CalendarEntry;
  anchorRect: DOMRect;
  onClose: () => void;
  onRemove: (date: string, mealType: MealType) => Promise<void>;
  removing: boolean;
  t: (key: string) => string;
}

function MealPopover({ entry, anchorRect, onClose, onRemove, removing, t }: MealPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Position the popover relative to anchor
  const top = anchorRect.bottom + window.scrollY + 6;
  const left = Math.min(
    anchorRect.left + window.scrollX,
    window.innerWidth - 240 - 16
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top,
        left,
        width: 232,
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)',
        border: '1px solid var(--color-border)',
        zIndex: 200,
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      {/* Recipe name */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--color-ink)',
            lineHeight: 1.3,
          }}
        >
          {entry.recipeName}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            color: 'var(--color-ink-faint)',
            marginTop: 2,
          }}
        >
          Added by {entry.addedByName}
        </p>
      </div>

      {/* Actions */}
      <div style={{ padding: '8px 0' }}>
        <Link
          href={`/recipes?id=${entry.recipeId}`}
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 16px',
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            color: 'var(--color-ink)',
            textDecoration: 'none',
            transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-surface-raised)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
          }}
        >
          {/* Eye icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View Recipe
        </Link>

        <button
          onClick={() => onRemove(entry.date, entry.mealType)}
          disabled={removing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 16px',
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            color: removing ? 'var(--color-ink-faint)' : 'var(--color-error)',
            background: 'none',
            border: 'none',
            cursor: removing ? 'not-allowed' : 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => {
            if (!removing) (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-error-bg)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          {/* Trash icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
          {removing ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  );
}

type PickerTab = 'family' | 'starred' | 'community';

interface RecipePickerSheetProps {
  mealType: MealType;
  date: string;
  familyRecipes: Recipe[];
  starredRecipes: Recipe[];
  communityRecipes: Recipe[];
  lastCookedMap: Map<string, string>;
  loading: boolean;
  onPick: (recipe: Recipe) => void;
  onClose: () => void;
  adding: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function RecipePickerSheet({
  mealType,
  date,
  familyRecipes,
  starredRecipes,
  communityRecipes,
  lastCookedMap,
  loading,
  onPick,
  onClose,
  adding,
  t,
}: RecipePickerSheetProps) {
  const [pickerTab, setPickerTab] = useState<PickerTab>('family');
  const [search, setSearch] = useState('');

  const dateLabel = formatShortDate(date);
  const mealLabel = t(`calendar_${mealType}` as Parameters<typeof t>[0]);

  const tabRecipes = pickerTab === 'family' ? familyRecipes : pickerTab === 'starred' ? starredRecipes : communityRecipes;
  const filtered = search.trim()
    ? tabRecipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : tabRecipes;

  const pickerTabs: { key: PickerTab; label: string }[] = [
    { key: 'family', label: t('recipe_family') },
    { key: 'starred', label: t('recipe_starred') },
    { key: 'community', label: t('recipe_community') },
  ];

  const emptyKeys: Record<PickerTab, string> = {
    family: 'recipe_empty_family',
    starred: 'recipe_empty_starred',
    community: 'recipe_empty_community',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 100,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('calendar_pick_recipe')}
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          maxHeight: '70vh',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'var(--color-border)',
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            padding: '12px 20px 14px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  lineHeight: 1.2,
                }}
              >
                {t('calendar_pick_recipe')}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  color: 'var(--color-ink-muted)',
                  marginTop: 2,
                }}
              >
                {mealLabel} &middot; {dateLabel}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label={t('close')}
              style={{
                background: 'var(--color-surface-raised)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 0,
              marginTop: 12,
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}
          >
            {pickerTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPickerTab(tab.key)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  fontSize: 13,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: pickerTab === tab.key ? 600 : 400,
                  background: pickerTab === tab.key ? 'var(--color-accent)' : 'transparent',
                  color: pickerTab === tab.key ? '#fff' : 'var(--color-ink)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0 12px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={t('recipe_search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                padding: '9px 0',
                border: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                color: 'var(--color-ink)',
                outline: 'none',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                aria-label="Clear search"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-faint)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Recipe list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {loading ? (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBlock key={i} height={52} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                color: 'var(--color-ink-muted)',
              }}
            >
              {search ? 'No recipes match your search.' : t(emptyKeys[pickerTab])}
            </div>
          ) : (
            <div style={{ padding: '4px 12px 16px' }}>
              {filtered.map((recipe) => {
                const lastDate = lastCookedMap.get(recipe.id);
                return (
                  <button
                    key={recipe.id}
                    onClick={() => !adding && onPick(recipe)}
                    disabled={adding}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '12px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: adding ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      gap: 12,
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-raised)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--color-ink)',
                          lineHeight: 1.3,
                          display: 'block',
                        }}
                      >
                        {recipe.name}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: 12,
                          color: 'var(--color-ink-faint)',
                          lineHeight: 1.3,
                        }}
                      >
                        {lastDate
                          ? t('calendar_last_cooked', { date: formatShortDate(lastDate) })
                          : t('calendar_never_cooked')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {recipe.prepTime > 0 && (
                        <span
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: 12,
                            color: 'var(--color-ink-faint)',
                          }}
                        >
                          {recipe.prepTime}m
                        </span>
                      )}
                      {recipe.plants > 0 && (
                        <span
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: 11,
                            color: 'var(--color-accent)',
                            background: 'var(--color-accent-bg)',
                            padding: '2px 7px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 500,
                          }}
                        >
                          {recipe.plants}P
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function CalendarScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [weekOffset, setWeekOffset] = useState(0);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Popover (planned meal detail)
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [removing, setRemoving] = useState(false);

  // Recipe picker sheet
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState('');
  const [pickerMeal, setPickerMeal] = useState<MealType>('dinner');
  const [pickerFamilyRecipes, setPickerFamilyRecipes] = useState<Recipe[]>([]);
  const [pickerStarredRecipes, setPickerStarredRecipes] = useState<Recipe[]>([]);
  const [pickerCommunityRecipes, setPickerCommunityRecipes] = useState<Recipe[]>([]);
  const [lastCookedMap, setLastCookedMap] = useState<Map<string, string>>(new Map());
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const days = getWeekDates(weekOffset);
  const dateStrings = days.map((d) => d.date);

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!user?.familyId) return;
    setLoading(true);
    setError(null);
    const unsub = listenToWeekCalendar(user.familyId, dateStrings, (data) => {
      setEntries(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.familyId, weekOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickerDataLoaded = useRef(false);
  const ensureRecipesLoaded = async () => {
    if (!user || pickerDataLoaded.current) return;
    pickerDataLoaded.current = true;
    setRecipesLoading(true);
    try {
      const [family, starredIds, community, allEntries] = await Promise.all([
        user.familyId ? fetchFamilyRecipes(user.familyId) : Promise.resolve([]),
        getStarredIds(user.uid),
        fetchCommunityRecipes(),
        user.familyId ? fetchAllCalendarEntries(user.familyId) : Promise.resolve([]),
      ]);
      const starred = await fetchRecipesByIds(starredIds);
      setPickerFamilyRecipes(family);
      setPickerStarredRecipes(starred);
      setPickerCommunityRecipes(community);

      // Build last-cooked map: recipeId -> most recent date string
      const map = new Map<string, string>();
      for (const entry of allEntries) {
        const existing = map.get(entry.recipeId);
        if (!existing || entry.date > existing) {
          map.set(entry.recipeId, entry.date);
        }
      }
      setLastCookedMap(map);
    } catch {
      // non-fatal; lists will be empty
    } finally {
      setRecipesLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Interactions
  // ---------------------------------------------------------------------------

  const getEntry = (date: string, mealType: MealType) =>
    entries.find((e) => e.date === date && e.mealType === mealType);

  const handleCellClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    entry: CalendarEntry
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({ entry, anchorRect: rect });
  };

  const handleAddClick = async (date: string, mealType: MealType) => {
    setPickerDate(date);
    setPickerMeal(mealType);
    setShowPicker(true);
    await ensureRecipesLoaded();
  };

  const handlePickRecipe = async (recipe: Recipe) => {
    if (!user?.familyId) return;
    setAdding(true);
    try {
      await addToCalendar(user.familyId, {
        recipeId: recipe.id,
        recipeName: recipe.name,
        mealType: pickerMeal,
        date: pickerDate,
        addedBy: user.uid,
        addedByName: user.name,
      });
      // Update plant diversity count for the week this meal falls in
      if (recipe.produce && recipe.produce.length > 0) {
        const mealDate = new Date(pickerDate + 'T12:00:00');
        const weekId = getWeekId(mealDate);
        logMealProduce(user.familyId, weekId, recipe.produce).catch(() => {});
      }
      await logActivity(user.familyId, {
        userId: user.uid,
        userName: user.name,
        type: 'calendar_added',
        payload: {
          recipeName: recipe.name,
          recipeId: recipe.id,
          date: pickerDate,
          mealType: pickerMeal,
        },
      });
      setShowPicker(false);
    } catch {
      // non-fatal; user can retry
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (date: string, mealType: MealType) => {
    if (!user?.familyId) return;
    setRemoving(true);
    try {
      await removeFromCalendar(user.familyId, date, mealType);
      setEntries((prev) =>
        prev.filter((e) => !(e.date === date && e.mealType === mealType))
      );
      setPopover(null);
      // Recalculate plant diversity for the affected week
      recalculateWeekDiversity(user.familyId, date).catch(() => {});
    } catch {
      // non-fatal
    } finally {
      setRemoving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const plannedCount = entries.length;

  return (
    <div className="page-content" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* ---- Page header ---- */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-ink)',
            lineHeight: 1.1,
          }}
        >
          {t('calendar_title')}
        </h1>
      </div>

      {/* ---- No family guard ---- */}
      {!user?.familyId ? (
        <NoFamilyState t={t} />
      ) : (
        <>
          {/* ---- Week navigation ---- */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              aria-label="Previous week"
              style={navArrowStyle}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--color-ink-muted)',
                }}
              >
                {t('calendar_week_of')} {formatShortDate(days[0].date)}
              </span>
            </div>

            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              aria-label="Next week"
              style={navArrowStyle}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Planned count pill */}
          {!loading && plannedCount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--color-accent)',
                  background: 'var(--color-accent-bg)',
                  padding: '3px 12px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {t('calendar_planned', { n: plannedCount })}
              </span>
            </div>
          )}

          {/* ---- Error ---- */}
          {error && (
            <div
              style={{
                background: 'var(--color-error-bg)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                color: 'var(--color-error)',
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* ---- Calendar grid ---- */}
          {loading ? (
            <CalendarSkeleton />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Column header row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '52px 1fr 1fr 1fr',
                  gap: 2,
                  marginBottom: 2,
                }}
              >
                <div />
                {MEAL_TYPES.map((m) => (
                  <div
                    key={m}
                    style={{
                      textAlign: 'center',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--color-ink-faint)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '4px 0',
                    }}
                  >
                    {t(`calendar_${m}` as Parameters<typeof t>[0])}
                  </div>
                ))}
              </div>

              {/* Day rows */}
              {days.map((day) => (
                <div
                  key={day.date}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '52px 1fr 1fr 1fr',
                    gap: 2,
                    minHeight: 56,
                  }}
                >
                  {/* Day label */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      padding: '0 4px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: day.isToday ? 'var(--color-accent)' : 'var(--color-ink-faint)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {day.isToday ? t('date_today') : `${t(`day_${day.short.toLowerCase()}`)} ${day.date.split('-')[2].replace(/^0/, '')}`}
                    </span>
                    {day.isToday && (
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: 'var(--color-accent)',
                        }}
                      />
                    )}
                  </div>

                  {/* Meal cells */}
                  {MEAL_TYPES.map((mealType) => {
                    const entry = getEntry(day.date, mealType);
                    return (
                      <div
                        key={mealType}
                        style={{
                          background: entry
                            ? 'var(--color-accent-bg)'
                            : 'var(--color-surface)',
                          border: `1px solid ${entry ? 'transparent' : 'var(--color-border)'}`,
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          minHeight: 48,
                        }}
                      >
                        {entry ? (
                          <button
                            onClick={(e) => handleCellClick(e, entry)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                              padding: '6px 4px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'var(--font-ui)',
                                fontSize: 11,
                                fontWeight: 500,
                                color: 'var(--color-accent)',
                                lineHeight: 1.25,
                                textAlign: 'center',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {entry.recipeName}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddClick(day.date, mealType)}
                            aria-label={`${t('calendar_add')} — ${day.label}, ${t(`calendar_${mealType}` as Parameters<typeof t>[0])}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="var(--color-border)"
                              strokeWidth="2"
                              strokeLinecap="round"
                              aria-hidden="true"
                            >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ---- Meal popover ---- */}
      {popover && (
        <MealPopover
          entry={popover.entry}
          anchorRect={popover.anchorRect}
          onClose={() => setPopover(null)}
          onRemove={handleRemove}
          removing={removing}
          t={t}
        />
      )}

      {/* ---- Recipe picker sheet ---- */}
      {showPicker && (
        <RecipePickerSheet
          mealType={pickerMeal}
          date={pickerDate}
          familyRecipes={pickerFamilyRecipes}
          starredRecipes={pickerStarredRecipes}
          communityRecipes={pickerCommunityRecipes}
          lastCookedMap={lastCookedMap}
          loading={recipesLoading}
          onPick={handlePickRecipe}
          onClose={() => setShowPicker(false)}
          adding={adding}
          t={t}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function CalendarSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr 1fr', gap: 2, marginBottom: 2 }}>
        <div />
        {[0, 1, 2].map((i) => (
          <SkeletonBlock key={i} height={20} />
        ))}
      </div>
      {/* 7 day rows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr 1fr', gap: 2 }}>
          <SkeletonBlock height={48} width="40px" />
          <SkeletonBlock height={48} />
          <SkeletonBlock height={48} />
          <SkeletonBlock height={48} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static styles
// ---------------------------------------------------------------------------

const navArrowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  color: 'var(--color-ink)',
  flexShrink: 0,
};
// named re-export
export { CalendarScreen };

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import {
  fetchRecipe,
  toggleStarRecipe,
  rateRecipe,
  getUserRating,
} from '@/services/recipes';
import { addToCalendar } from '@/services/calendar';
import { addToGrocery } from '@/services/grocery';
import { logActivity } from '@/services/activity';
import type { Recipe, MealType } from '@/types';
import { MEAL_TYPES, getWeekDates } from '@/types';
import { PageLoader } from '@/components/layout/LoadingSpinner';

export default function RecipeDetailScreen({ recipeId }: { recipeId: string }) {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [starLoading, setStarLoading] = useState(false);

  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  const [showCalModal, setShowCalModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('dinner');
  const [calLoading, setCalLoading] = useState(false);
  const [groceryLoading, setGroceryLoading] = useState(false);
  const [groceryAdded, setGroceryAdded] = useState(false);

  const isOwner = user?.uid === recipe?.createdBy;
  const weekDays = getWeekDates(0);

  useEffect(() => {
    setLoading(true);
    fetchRecipe(recipeId)
      .then(setRecipe)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [recipeId]);

  useEffect(() => {
    if (!user) return;
    // check if starred
    const starred = user.starredRecipes || [];
    setIsStarred(starred.includes(recipeId));
    // get user rating
    getUserRating(user.uid, recipeId)
      .then(setUserRating)
      .catch(console.error);
  }, [user, recipeId]);

  const handleStar = async () => {
    if (!user || starLoading) return;
    setStarLoading(true);
    try {
      const nowStarred = await toggleStarRecipe(user.uid, recipeId);
      setIsStarred(nowStarred);
    } catch (e) {
      console.error(e);
    } finally {
      setStarLoading(false);
    }
  };

  const handleRate = async (score: number) => {
    if (!user || ratingLoading || isOwner) return;
    setRatingLoading(true);
    try {
      await rateRecipe(user.uid, recipeId, score);
      setUserRating(score);
      // refresh recipe for updated score
      const updated = await fetchRecipe(recipeId);
      if (updated) setRecipe(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setRatingLoading(false);
    }
  };

  const handleAddToCalendar = async () => {
    if (!user || !user.familyId || !recipe || !selectedDay) return;
    setCalLoading(true);
    try {
      await addToCalendar(user.familyId, {
        recipeId: recipe.id,
        recipeName: recipe.name,
        mealType: selectedMeal,
        date: selectedDay,
        addedBy: user.uid,
        addedByName: user.name,
      });
      await logActivity(user.familyId, {
        userId: user.uid,
        userName: user.name,
        type: 'calendar_added',
        payload: { recipeName: recipe.name, date: selectedDay, mealType: selectedMeal },
      });
      setShowCalModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setCalLoading(false);
    }
  };

  const handleAddToGrocery = async () => {
    if (!user || !user.familyId || !recipe || groceryLoading) return;
    setGroceryLoading(true);
    try {
      const items = recipe.ingredients.map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        checked: false,
        addedBy: user.uid,
        addedByName: user.name,
        recipeId: recipe.id,
        recipeName: recipe.name,
      }));
      await addToGrocery(user.familyId, items);
      await logActivity(user.familyId, {
        userId: user.uid,
        userName: user.name,
        type: 'grocery_added',
        payload: { recipeName: recipe.name },
      });
      setGroceryAdded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setGroceryLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!recipe) {
    return (
      <div style={{ textAlign: 'center', padding: 48, fontFamily: 'var(--font-ui)', color: 'var(--color-ink)', opacity: 0.5 }}>
        {t('error_not_found')}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 80 }}>
      {/* Back */}
      <button
        onClick={() => router.push('/recipes')}
        style={{
          alignSelf: 'flex-start',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          fontFamily: 'var(--font-ui)',
          color: 'var(--color-accent)',
          padding: 0,
        }}
      >
        &#8592; {t('back')}
      </button>

      {/* Name */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--color-ink)',
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {recipe.name}
      </h1>

      {/* Meta chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {recipe.cuisine && <Chip>{recipe.cuisine}</Chip>}
        <Chip>{recipe.prepTime}min</Chip>
        <Chip>{recipe.servings} {t('recipe_servings').toLowerCase()}</Chip>
        <Chip>{recipe.plants} {t('recipe_plants').toLowerCase()}</Chip>
      </div>

      {/* Season badges */}
      {recipe.seasons.length > 0 && (
        <div style={{ display: 'flex', gap: 6 }}>
          {recipe.seasons.map((s) => (
            <span
              key={s}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-accent)',
                color: '#fff',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {t(`season_${s}`)}
            </span>
          ))}
        </div>
      )}

      {/* Community score */}
      {recipe.communityScore != null && recipe.ratingCount != null && recipe.ratingCount > 0 && (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)' }}>
          <span style={{ fontWeight: 600 }}>{t('recipe_community_score')}:</span>{' '}
          {renderStars(recipe.communityScore)} ({recipe.communityScore.toFixed(1)}, {recipe.ratingCount})
        </div>
      )}

      {/* Interactive rating */}
      {!isOwner && user && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', opacity: 0.7 }}>
            {t('recipe_your_rating')}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => handleRate(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={ratingLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: ratingLoading ? 'wait' : 'pointer',
                  fontSize: 24,
                  color:
                    s <= (hoverRating || userRating || 0)
                      ? 'var(--color-warm, #D4A843)'
                      : 'var(--color-border)',
                  padding: 2,
                }}
              >
                &#9733;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {!isOwner && user && (
          <ActionButton onClick={handleStar} loading={starLoading}>
            {isStarred ? '★ ' + t('recipe_saved') : '☆ ' + t('recipe_save')}
          </ActionButton>
        )}
        {isOwner && (
          <ActionButton onClick={() => router.push(`/recipes/new?edit=${recipe.id}`)}>

            {t('recipe_edit')}
          </ActionButton>
        )}
      </div>

      {/* Description */}
      {recipe.description && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.6, margin: 0 }}>
          {recipe.description}
        </p>
      )}

      {/* Ingredients */}
      <Section title={t('recipe_ingredients')}>
        <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recipe.ingredients.map((ing, i) => (
            <li key={i} style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)' }}>
              {ing.amount} {ing.unit} {ing.name}
            </li>
          ))}
        </ul>
      </Section>

      {/* Produce */}
      {recipe.produce.length > 0 && (
        <Section title={t('recipe_produce')}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {recipe.produce.map((p) => (
              <span
                key={p}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--color-ink)',
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Add to Calendar / Grocery */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <ActionButton accent onClick={() => { setSelectedDay(weekDays[0].date); setShowCalModal(true); }}>
          {t('recipe_add_calendar')}
        </ActionButton>
        <ActionButton
          accent
          onClick={handleAddToGrocery}
          loading={groceryLoading}
          disabled={groceryAdded}
        >
          {groceryAdded ? '✓ ' + t('recipe_add_grocery') : t('recipe_add_grocery')}
        </ActionButton>
      </div>

      {/* Calendar modal */}
      {showCalModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowCalModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0, color: 'var(--color-ink)' }}>
              {t('recipe_add_calendar')}
            </h3>

            {/* Day picker */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {weekDays.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDay(d.date)}
                  style={{
                    padding: '8px 12px',
                    fontSize: 13,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: selectedDay === d.date ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: selectedDay === d.date ? '#fff' : 'var(--color-ink)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: d.isToday ? 700 : 400,
                  }}
                >
                  {d.short} {d.date.split('-')[2]}
                </button>
              ))}
            </div>

            {/* Meal type */}
            <div style={{ display: 'flex', gap: 6 }}>
              {MEAL_TYPES.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMeal(m)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    fontSize: 13,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: selectedMeal === m ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: selectedMeal === m ? '#fff' : 'var(--color-ink)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {t(`mealType_${m}`)}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowCalModal(false)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleAddToCalendar}
                disabled={calLoading || !selectedDay}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--color-accent)',
                  color: '#fff',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: calLoading ? 'wait' : 'pointer',
                  opacity: calLoading ? 0.7 : 1,
                }}
              >
                {calLoading ? t('loading') : t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: '4px 10px',
        fontSize: 12,
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        fontFamily: 'var(--font-ui)',
        color: 'var(--color-ink)',
      }}
    >
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--color-ink)',
          margin: 0,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  loading,
  disabled,
  accent,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: '10px 20px',
        borderRadius: 'var(--radius-md)',
        border: accent ? 'none' : '1px solid var(--color-border)',
        background: accent ? 'var(--color-accent)' : 'var(--color-surface)',
        color: accent ? '#fff' : 'var(--color-ink)',
        fontFamily: 'var(--font-ui)',
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function renderStars(score: number) {
  const full = Math.round(score);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

export { RecipeDetailScreen };

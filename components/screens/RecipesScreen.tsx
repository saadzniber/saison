'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { fetchMyRecipes, fetchCommunityRecipes, getStarredIds, fetchRecipesByIds } from '@/services/recipes';
import { fetchCuisines } from '@/services/cuisine';
import type { Recipe, Cuisine, Season } from '@/types';
import { SEASONS } from '@/types';
import { SkeletonBlock } from '@/components/layout/LoadingSpinner';

type Tab = 'my' | 'starred' | 'community';

function RecipeCard({
  recipe,
  starredIds,
}: {
  recipe: Recipe;
  starredIds: Set<string>;
}) {
  const router = useRouter();
  const isStarred = starredIds.has(recipe.id);

  return (
    <button
      onClick={() => router.push(`/recipes?id=${recipe.id}`)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 16,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--color-ink)',
            lineHeight: 1.3,
          }}
        >
          {recipe.name}
        </span>
        {isStarred && <span style={{ fontSize: 14, flexShrink: 0 }}>&#9733;</span>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {recipe.cuisine && (
          <span style={chipStyle}>{recipe.cuisine}</span>
        )}
        <span style={chipStyle}>{recipe.prepTime}min</span>
        <span style={chipStyle}>{recipe.plants} plants</span>
        {recipe.communityScore != null && recipe.communityScore > 0 && (
          <span style={chipStyle}>
            {'★'.repeat(Math.round(recipe.communityScore))} {recipe.communityScore.toFixed(1)}
          </span>
        )}
      </div>
    </button>
  );
}

const chipStyle: React.CSSProperties = {
  fontSize: 12,
  padding: '2px 8px',
  background: 'var(--color-bg)',
  borderRadius: 'var(--radius-full)',
  color: 'var(--color-ink)',
  opacity: 0.75,
};

function SkeletonCard() {
  return (
    <div
      style={{
        padding: 16,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <SkeletonBlock height="18px" width="60%" />
      <div style={{ display: 'flex', gap: 6 }}>
        <SkeletonBlock height="20px" width="50px" />
        <SkeletonBlock height="20px" width="45px" />
        <SkeletonBlock height="20px" width="60px" />
      </div>
    </div>
  );
}

export default function RecipesScreen() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('my');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [starredRecipes, setStarredRecipes] = useState<Recipe[]>([]);
  const [communityRecipes, setCommunityRecipes] = useState<Recipe[]>([]);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<Season | ''>('');
  const [cuisineFilter, setCuisineFilter] = useState('');

  useEffect(() => {
    fetchCuisines().then(setCuisines).catch(console.error);
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    if (tab === 'my') {
      fetchMyRecipes(user.uid)
        .then(setMyRecipes)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (tab === 'starred') {
      getStarredIds(user.uid)
        .then((ids) => {
          setStarredIds(new Set(ids));
          return fetchRecipesByIds(ids);
        })
        .then(setStarredRecipes)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      const filter: { season?: string; cuisine?: string } = {};
      if (seasonFilter) filter.season = seasonFilter;
      if (cuisineFilter) filter.cuisine = cuisineFilter;
      fetchCommunityRecipes(Object.keys(filter).length ? filter : undefined)
        .then(setCommunityRecipes)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, tab, seasonFilter, cuisineFilter]);

  // Also load starred IDs for "my" tab star indicator
  useEffect(() => {
    if (!user) return;
    getStarredIds(user.uid)
      .then((ids) => setStarredIds(new Set(ids)))
      .catch(console.error);
  }, [user]);

  const recipes = tab === 'my' ? myRecipes : tab === 'starred' ? starredRecipes : communityRecipes;

  const filtered = useMemo(() => {
    if (!search.trim()) return recipes;
    const q = search.toLowerCase();
    return recipes.filter((r) => r.name.toLowerCase().includes(q));
  }, [recipes, search]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'my', label: t('recipe_my') },
    { key: 'starred', label: t('recipe_starred') },
    { key: 'community', label: t('recipe_community') },
  ];

  const emptyKeys: Record<Tab, string> = {
    my: 'recipe_empty_my',
    starred: 'recipe_empty_starred',
    community: 'recipe_empty_community',
  };

  const cuisineName = (c: Cuisine) =>
    locale === 'fr' ? c.name.fr : c.name.en;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        {tabs.map((t_) => (
          <button
            key={t_.key}
            onClick={() => setTab(t_.key)}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: 14,
              fontFamily: 'var(--font-ui)',
              fontWeight: tab === t_.key ? 600 : 400,
              background: tab === t_.key ? 'var(--color-accent)' : 'transparent',
              color: tab === t_.key ? '#fff' : 'var(--color-ink)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {t_.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={t('recipe_search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          fontSize: 14,
          fontFamily: 'var(--font-ui)',
          background: 'var(--color-surface)',
          color: 'var(--color-ink)',
          outline: 'none',
        }}
      />

      {/* Community filters */}
      {tab === 'community' && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SEASONS.map((s) => (
            <button
              key={s}
              onClick={() => setSeasonFilter(seasonFilter === s ? '' : s)}
              style={{
                padding: '4px 12px',
                fontSize: 12,
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                background: seasonFilter === s ? 'var(--color-accent)' : 'var(--color-surface)',
                color: seasonFilter === s ? '#fff' : 'var(--color-ink)',
                cursor: 'pointer',
              }}
            >
              {t(`season_${s}`)}
            </button>
          ))}
          {cuisines.slice(0, 6).map((c) => (
            <button
              key={c.id}
              onClick={() => setCuisineFilter(cuisineFilter === c.id ? '' : c.id)}
              style={{
                padding: '4px 12px',
                fontSize: 12,
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                background: cuisineFilter === c.id ? 'var(--color-accent)' : 'var(--color-surface)',
                color: cuisineFilter === c.id ? '#fff' : 'var(--color-ink)',
                cursor: 'pointer',
              }}
            >
              {c.emoji} {cuisineName(c)}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px',
            color: 'var(--color-ink)',
            opacity: 0.5,
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
          }}
        >
          <p>{t(emptyKeys[tab])}</p>
          {tab === 'my' && (
            <button
              onClick={() => router.push('/recipes/new')}
              style={{
                marginTop: 16,
                padding: '10px 24px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-accent)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              + {t('recipe_new')}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} starredIds={starredIds} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => router.push('/recipes/new')}
        aria-label={t('recipe_new')}
        style={{
          position: 'fixed',
          bottom: 'calc(var(--nav-height) + 20px)',
          right: 20,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          color: '#fff',
          border: 'none',
          fontSize: 28,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        +
      </button>
    </div>
  );
}
// named re-export
export { RecipesScreen };

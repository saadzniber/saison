'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { createRecipe, updateRecipe, fetchRecipe } from '@/services/recipes';
import { fetchCuisines } from '@/services/cuisine';
import { PRODUCE_CATALOGUE } from '@/services/produce';
import { logActivity } from '@/services/activity';
import { getProduceName } from '@/types';
import type { Ingredient, Cuisine, Season } from '@/types';
import { SEASONS } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Types                                                                       */
/* -------------------------------------------------------------------------- */

interface FormErrors {
  name?: string;
  ingredients?: string;
  general?: string;
}

/* -------------------------------------------------------------------------- */
/*  Shared styles                                                               */
/* -------------------------------------------------------------------------- */

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  fontSize: 14,
  fontFamily: 'var(--font-ui)',
  background: 'var(--color-surface)',
  color: 'var(--color-ink)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

/* -------------------------------------------------------------------------- */
/*  Field wrapper                                                               */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  error,
  children,
  style,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--color-ink-muted)',
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-error)' }}>
          {error}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section card                                                                */
/* -------------------------------------------------------------------------- */

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          fontWeight: 400,
          color: 'var(--color-ink)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Produce search + multi-select                                               */
/* -------------------------------------------------------------------------- */

function ProducePicker({
  selected,
  onChange,
  locale,
  label,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  locale: string;
  label: string;
}) {
  const [query, setQuery] = useState('');

  const filtered = PRODUCE_CATALOGUE.filter((p) => {
    if (!query) return true;
    const name = getProduceName(p, locale).toLowerCase();
    return name.includes(query.toLowerCase());
  });

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Selected count badge */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              color: 'var(--color-accent)',
              background: 'var(--color-accent-bg)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
            }}
          >
            {selected.length} selected
          </span>
          {PRODUCE_CATALOGUE.filter((p) => selected.includes(p.id))
            .slice(0, 4)
            .map((p) => (
              <span key={p.id} style={{ fontSize: 18 }}>
                {p.emoji}
              </span>
            ))}
          {selected.length > 4 && (
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                color: 'var(--color-ink-faint)',
              }}
            >
              +{selected.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${label.toLowerCase()}...`}
        style={inputStyle}
      />

      {/* Chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          maxHeight: 180,
          overflowY: 'auto',
          padding: '2px 0',
        }}
      >
        {filtered.map((p) => {
          const isSelected = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                border: isSelected
                  ? '1.5px solid var(--color-accent)'
                  : '1px solid var(--color-border)',
                background: isSelected ? 'var(--color-accent-bg)' : 'var(--color-surface)',
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'var(--color-accent)' : 'var(--color-ink)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 15 }}>{p.emoji}</span>
              {getProduceName(p, locale)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main screen                                                                 */
/* -------------------------------------------------------------------------- */

function CreateRecipeForm() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [saving, setSaving] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(!!editId);
  const [errors, setErrors] = useState<FormErrors>({});
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);

  /* Form state */
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [prepTime, setPrepTime] = useState<number>(30);
  const [servings, setServings] = useState<number>(4);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '', unit: '' },
  ]);
  const [produceIds, setProduceIds] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  /* Load cuisines */
  useEffect(() => {
    fetchCuisines().then(setCuisines).catch(() => {});
  }, []);

  /* Load existing recipe for editing */
  useEffect(() => {
    if (!editId) return;
    setLoadingRecipe(true);
    fetchRecipe(editId)
      .then((recipe) => {
        if (!recipe) return;
        setName(recipe.name);
        setDescription(recipe.description || '');
        setCuisine(recipe.cuisine || '');
        setSeasons(recipe.seasons || []);
        setPrepTime(recipe.prepTime || 30);
        setServings(recipe.servings || 4);
        setIngredients(
          recipe.ingredients.length > 0
            ? recipe.ingredients
            : [{ name: '', amount: '', unit: '' }]
        );
        // Map produce names back to IDs
        const ids = PRODUCE_CATALOGUE
          .filter((p) => recipe.produce.includes(getProduceName(p, 'en')))
          .map((p) => p.id);
        setProduceIds(ids);
        setIsPublic(recipe.isPublic || false);
      })
      .catch(() => {})
      .finally(() => setLoadingRecipe(false));
  }, [editId]);

  /* Ingredient helpers */
  const updateIngredient = (idx: number, field: keyof Ingredient, value: string) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (idx: number) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  /* Season toggle */
  const toggleSeason = (s: Season) => {
    setSeasons((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  /* Validation */
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!name.trim()) e.name = t('create_error_name');
    const valid = ingredients.filter((ing) => ing.name.trim());
    if (valid.length === 0) e.ingredients = t('create_error_ingredients');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* Save */
  const handleSave = async () => {
    if (!user || saving) return;
    if (!validate()) return;

    setSaving(true);
    setErrors({});

    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    const produceNames = PRODUCE_CATALOGUE.filter((p) => produceIds.includes(p.id)).map(
      (p) => getProduceName(p, 'en')
    );

    try {
      if (editId) {
        await updateRecipe(editId, user.uid, {
          name: name.trim(),
          description: description.trim(),
          cuisine,
          seasons,
          prepTime,
          servings,
          ingredients: validIngredients,
          produce: produceNames,
          plants: produceIds.length,
          isPublic,
        });
      } else {
        await createRecipe(
          {
            name: name.trim(),
            description: description.trim(),
            cuisine,
            seasons,
            prepTime,
            servings,
            ingredients: validIngredients,
            produce: produceNames,
            plants: produceIds.length,
            isPublic,
            createdBy: user.uid,
            createdByName: user.name,
          },
          user.uid,
          user.name
        );

        if (user.familyId) {
          await logActivity(user.familyId, {
            userId: user.uid,
            userName: user.name,
            userPhoto: user.photoUrl,
            type: 'recipe_created',
            payload: { recipeName: name.trim() },
          }).catch(() => {});
        }
      }

      router.push('/recipes');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message.toLowerCase().includes('permission')
            ? t('create_error_permission')
            : err.message.toLowerCase().includes('offline') ||
              err.message.toLowerCase().includes('network')
            ? t('create_error_offline')
            : t('create_error_save')
          : t('create_error_save');
      setErrors({ general: msg });
      setSaving(false);
    }
  };

  const cuisineName = (c: Cuisine) => (locale === 'fr' ? c.name.fr : c.name.en);

  const SEASON_EMOJI: Record<Season, string> = {
    spring: '🌿',
    summer: '☀️',
    autumn: '🍂',
    winter: '❄️',
  };

  if (loadingRecipe) {
    return (
      <div className="page-content" style={{ maxWidth: 430, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 28, height: 28, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="page-content" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => router.push('/recipes')}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          aria-label={t('back')}
        >
          {/* left arrow SVG */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 400,
            color: 'var(--color-ink)',
            margin: 0,
          }}
        >
          {editId ? t('recipe_edit') : t('create_title')}
        </h1>
      </div>

      {/* General error */}
      {errors.general && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            color: 'var(--color-error)',
            marginBottom: 16,
          }}
        >
          {errors.general}
        </div>
      )}

      {/* Form sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Basics ─────────────────────────────── */}
        <FormSection title="Basics">
          <Field label={t('create_name')} error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('create_name')}
              style={inputStyle}
            />
          </Field>

          <Field label={t('create_description')}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t('create_description')}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </Field>

          <Field label={t('create_cuisine')}>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              style={inputStyle}
            >
              <option value="">— Select cuisine —</option>
              {cuisines.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {cuisineName(c)}
                </option>
              ))}
            </select>
          </Field>

          {/* Prep time + servings inline */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label={t('create_preptime')} style={{ flex: 1 }}>
              <input
                type="number"
                min={1}
                value={prepTime}
                onChange={(e) => setPrepTime(Math.max(1, Number(e.target.value) || 1))}
                style={inputStyle}
              />
            </Field>
            <Field label={t('create_servings')} style={{ flex: 1 }}>
              <input
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))}
                style={inputStyle}
              />
            </Field>
          </div>
        </FormSection>

        {/* ── Seasons ─────────────────────────────── */}
        <FormSection title={t('create_seasons')}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SEASONS.map((s) => {
              const active = seasons.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSeason(s)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '7px 14px',
                    fontSize: 13,
                    borderRadius: 'var(--radius-full)',
                    border: active
                      ? '1.5px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                    background: active ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: active ? '#fff' : 'var(--color-ink)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: active ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{SEASON_EMOJI[s]}</span>
                  {t(`season_${s}`)}
                </button>
              );
            })}
          </div>
        </FormSection>

        {/* ── Ingredients ──────────────────────────── */}
        <FormSection title={t('create_ingredients')}>
          {errors.ingredients && (
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-error)' }}>
              {errors.ingredients}
            </span>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Column headers */}
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 64, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-faint)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                Amt
              </span>
              <span style={{ width: 64, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-faint)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                Unit
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-faint)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ingredient
              </span>
            </div>

            {ingredients.map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="1"
                  value={ing.amount}
                  onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                  style={{ ...inputStyle, width: 64, flexShrink: 0 }}
                />
                <input
                  type="text"
                  placeholder="cup"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                  style={{ ...inputStyle, width: 64, flexShrink: 0 }}
                />
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  disabled={ingredients.length <= 1}
                  aria-label="Remove ingredient"
                  style={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: ingredients.length <= 1 ? 'default' : 'pointer',
                    opacity: ingredients.length <= 1 ? 0.2 : 0.6,
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-error)',
                    padding: 0,
                  }}
                >
                  {/* x SVG */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addIngredient}
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                fontSize: 13,
                fontFamily: 'var(--font-ui)',
                fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                border: '1.5px dashed var(--color-border)',
                background: 'transparent',
                color: 'var(--color-accent)',
                cursor: 'pointer',
              }}
            >
              {/* plus SVG */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t('create_add_ingredient')}
            </button>
          </div>
        </FormSection>

        {/* ── Produce ──────────────────────────────── */}
        <FormSection title={t('create_produce')}>
          <ProducePicker
            selected={produceIds}
            onChange={setProduceIds}
            locale={locale}
            label={t('create_produce')}
          />
        </FormSection>

        {/* ── Visibility ───────────────────────────── */}
        <FormSection title="Visibility">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  margin: 0,
                }}
              >
                {t('recipe_share_community')}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12,
                  color: 'var(--color-ink-muted)',
                  margin: '2px 0 0',
                }}
              >
                {isPublic ? 'Visible to everyone' : 'Only visible to your family'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic((v) => !v)}
              aria-pressed={isPublic}
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                border: 'none',
                background: isPublic ? 'var(--color-accent)' : 'var(--color-border)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: isPublic ? 23 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}
              />
            </button>
          </div>
        </FormSection>

        {/* ── Save button ──────────────────────────── */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '15px 0',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            background: saving ? 'var(--color-accent-light)' : 'var(--color-accent)',
            color: '#fff',
            fontFamily: 'var(--font-ui)',
            fontSize: 16,
            fontWeight: 600,
            cursor: saving ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'background 0.15s',
          }}
        >
          {saving && (
            <div
              style={{
                width: 16,
                height: 16,
                border: '2px solid rgba(255,255,255,0.6)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          )}
          {saving ? t('create_saving') : editId ? t('save') : t('create_save')}
        </button>
      </div>
    </div>
  );
}

export default function CreateRecipeScreen() {
  return (
    <Suspense fallback={null}>
      <CreateRecipeForm />
    </Suspense>
  );
}
export { CreateRecipeScreen };

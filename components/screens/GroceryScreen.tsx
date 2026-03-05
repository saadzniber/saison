'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import {
  fetchGroceryList,
  addToGrocery,
  toggleGroceryItem,
  deleteGroceryItem,
  clearCheckedItems,
} from '@/services/grocery';
import type { GroceryItem } from '@/types';
import { SkeletonBlock } from '@/components/layout/LoadingSpinner';

// ---------------------------------------------------------------------------
// Confirm dialog
// ---------------------------------------------------------------------------

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirming: boolean;
  t: (key: string) => string;
}

function ConfirmDialog({ message, onConfirm, onCancel, confirming, t }: ConfirmDialogProps) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 200,
          backdropFilter: 'blur(2px)',
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 48px)',
          maxWidth: 340,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          zIndex: 201,
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        <div style={{ padding: '22px 20px 10px' }}>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 15,
              color: 'var(--color-ink)',
              lineHeight: 1.5,
              textAlign: 'center',
            }}
          >
            {message}
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '14px',
              background: 'none',
              border: 'none',
              borderRight: '1px solid var(--color-border)',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: 15,
              color: 'var(--color-ink-muted)',
            }}
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            style={{
              padding: '14px',
              background: 'none',
              border: 'none',
              cursor: confirming ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: 15,
              fontWeight: 600,
              color: confirming ? 'var(--color-ink-faint)' : 'var(--color-error)',
            }}
          >
            {confirming ? '...' : t('confirm')}
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Swipeable grocery row
// ---------------------------------------------------------------------------

interface GroceryRowProps {
  item: GroceryItem;
  onToggle: (item: GroceryItem) => void;
  onDelete: (item: GroceryItem) => void;
  toggling: boolean;
  deleting: boolean;
}

function GroceryRow({ item, onToggle, onDelete, toggling, deleting }: GroceryRowProps) {
  const [deltaX, setDeltaX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startXRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const dx = e.touches[0].clientX - startXRef.current;
    setDeltaX(Math.max(-80, Math.min(0, dx)));
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (deltaX < -50) {
      onDelete(item);
    }
    setDeltaX(0);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
      {/* Delete reveal */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 72,
          background: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </div>

      {/* Row */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '13px 14px',
          background: 'var(--color-surface)',
          transform: `translateX(${deltaX}px)`,
          transition: swiping ? 'none' : 'transform 0.2s ease, opacity 0.2s',
          opacity: deleting ? 0.35 : 1,
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Checkbox */}
        <button
          onClick={() => !toggling && onToggle(item)}
          disabled={toggling}
          aria-label={item.checked ? 'Uncheck item' : 'Check item'}
          aria-pressed={item.checked}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: `2px solid ${item.checked ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: item.checked ? 'var(--color-accent)' : 'transparent',
            cursor: toggling ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s, border-color 0.15s',
          }}
        >
          {item.checked && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 15,
              color: item.checked ? 'var(--color-ink-faint)' : 'var(--color-ink)',
              textDecoration: item.checked ? 'line-through' : 'none',
              lineHeight: 1.3,
              display: 'block',
              transition: 'color 0.15s',
            }}
          >
            {item.name}
          </span>
          {(item.amount || item.recipeName || item.addedByName) && (
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                color: 'var(--color-ink-faint)',
                display: 'block',
                marginTop: 1,
              }}
            >
              {item.amount
                ? `${item.amount}${item.unit ? ' ' + item.unit : ''}`
                : ''}
              {item.recipeName
                ? `${item.amount ? ' · ' : ''}from ${item.recipeName}`
                : ''}
              {item.addedByName
                ? `${item.amount || item.recipeName ? ' · ' : ''}${item.addedByName.split(' ')[0]}`
                : ''}
            </span>
          )}
        </div>

        {/* X button */}
        <button
          onClick={() => !deleting && onDelete(item)}
          disabled={deleting}
          aria-label={`Remove ${item.name}`}
          style={{
            width: 28,
            height: 28,
            background: 'var(--color-surface-raised)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            cursor: deleting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: deleting ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-faint)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        paddingTop: 64,
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <rect width="72" height="72" rx="36" fill="var(--color-warm-bg)" />
        <path d="M22 28h28l-4 20H26L22 28z" stroke="var(--color-warm)" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M18 28h4M50 28h4" stroke="var(--color-warm)" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 36v8M36 36v8M42 36v8" stroke="var(--color-warm)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M28 22c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="var(--color-warm)" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <div>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--color-ink)',
            marginBottom: 8,
          }}
        >
          {t('grocery_empty')}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            color: 'var(--color-ink-muted)',
            lineHeight: 1.5,
            maxWidth: 220,
          }}
        >
          Add items below, or find ingredients in a recipe.
        </p>
      </div>
      <Link
        href="/recipes"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 22px',
          background: 'var(--color-warm)',
          color: '#fff',
          borderRadius: 'var(--radius-full)',
          fontFamily: 'var(--font-ui)',
          fontSize: 14,
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        {t('grocery_browse')}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function GroceryScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [newItemName, setNewItemName] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const familyId = user?.familyId;

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------

  const sortItems = (list: GroceryItem[]) => [
    ...list.filter((i) => !i.checked),
    ...list.filter((i) => i.checked),
  ];

  const loadItems = useCallback(
    async (silent = false) => {
      if (!familyId) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const data = await fetchGroceryList(familyId);
        setItems(sortItems(data));
      } catch {
        setError(t('error_generic'));
      } finally {
        setLoading(false);
      }
    },
    [familyId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await loadItems(true);
    setRefreshing(false);
  };

  // ---------------------------------------------------------------------------
  // Toggle
  // ---------------------------------------------------------------------------

  const handleToggle = async (item: GroceryItem) => {
    if (!familyId) return;
    const newChecked = !item.checked;

    setItems((prev) => sortItems(prev.map((i) => (i.id === item.id ? { ...i, checked: newChecked } : i))));
    setTogglingIds((s) => new Set(s).add(item.id));

    try {
      await toggleGroceryItem(familyId, item.id, newChecked);
    } catch {
      setItems((prev) => sortItems(prev.map((i) => (i.id === item.id ? { ...i, checked: item.checked } : i))));
    } finally {
      setTogglingIds((s) => { const n = new Set(s); n.delete(item.id); return n; });
    }
  };

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDelete = async (item: GroceryItem) => {
    if (!familyId) return;
    setDeletingIds((s) => new Set(s).add(item.id));
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      await deleteGroceryItem(familyId, item.id);
    } catch {
      setItems((prev) => sortItems([...prev, item]));
    } finally {
      setDeletingIds((s) => { const n = new Set(s); n.delete(item.id); return n; });
    }
  };

  // ---------------------------------------------------------------------------
  // Clear checked
  // ---------------------------------------------------------------------------

  const handleClearChecked = async () => {
    if (!familyId) return;
    setClearing(true);
    try {
      await clearCheckedItems(familyId);
      setItems((prev) => prev.filter((i) => !i.checked));
      setShowClearConfirm(false);
    } catch {
      setError(t('error_generic'));
    } finally {
      setClearing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Add item
  // ---------------------------------------------------------------------------

  const handleAddItem = async () => {
    const name = newItemName.trim();
    if (!name || !familyId || !user) return;
    setAddingItem(true);
    setNewItemName('');
    try {
      await addToGrocery(familyId, [
        { name, checked: false, addedBy: user.uid, addedByName: user.name },
      ]);
      await loadItems(true);
    } catch {
      setError(t('error_generic'));
      setNewItemName(name);
    } finally {
      setAddingItem(false);
      inputRef.current?.focus();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  const hasChecked = checked.length > 0;
  const isEmpty = !loading && items.length === 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="page-content" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* ---- Page header ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-ink)',
            lineHeight: 1.1,
          }}
        >
          {t('grocery_title')}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
          {/* Clear checked */}
          {hasChecked && (
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                background: 'var(--color-error-bg)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-error)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
              {t('grocery_clear_checked')}
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh grocery list"
            style={{
              width: 34,
              height: 34,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-ink-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{
                animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
                transformOrigin: 'center',
              }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* ---- Error banner ---- */}
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
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* ---- Loading skeleton ---- */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBlock key={i} height={58} />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState t={t} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Unchecked items */}
          {unchecked.length > 0 && (
            <section aria-label="Items to buy">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {unchecked.map((item) => (
                  <GroceryRow
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    toggling={togglingIds.has(item.id)}
                    deleting={deletingIds.has(item.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Checked items */}
          {checked.length > 0 && (
            <section aria-label="Items in basket">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-ink-faint)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  In basket ({checked.length})
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.55 }}>
                {checked.map((item) => (
                  <GroceryRow
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    toggling={togglingIds.has(item.id)}
                    deleting={deletingIds.has(item.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ---- Add item bar (sticky above nav) ---- */}
      {familyId && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(var(--nav-height) + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: 398,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            zIndex: 50,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Add an item..."
            disabled={addingItem}
            style={{
              flex: 1,
              padding: '13px 16px',
              border: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-ui)',
              fontSize: 15,
              color: 'var(--color-ink)',
              outline: 'none',
            }}
          />
          <button
            onClick={handleAddItem}
            disabled={!newItemName.trim() || addingItem}
            aria-label="Add item to grocery list"
            style={{
              width: 44,
              height: 44,
              margin: '5px',
              background: newItemName.trim() && !addingItem ? 'var(--color-accent)' : 'var(--color-border)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: newItemName.trim() && !addingItem ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            {addingItem ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                style={{ animation: 'spin 0.8s linear infinite', transformOrigin: 'center' }}
              >
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* ---- Clear checked confirm ---- */}
      {showClearConfirm && (
        <ConfirmDialog
          message={t('grocery_confirm_clear')}
          onConfirm={handleClearChecked}
          onCancel={() => setShowClearConfirm(false)}
          confirming={clearing}
          t={t}
        />
      )}
    </div>
  );
}
// named re-export
export { GroceryScreen };

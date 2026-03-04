import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Firebase ─────────────────────────────────────────────────────────────
vi.mock('@/lib/firebase', () => ({
  getDb: vi.fn(() => ({})),
  getFirebaseAuth: vi.fn(() => ({})),
  googleProvider: {},
}));

// ── Mock Firestore functions ──────────────────────────────────────────────────
// Note: vi.mock is hoisted so factories cannot reference outer const variables.
// Use vi.fn() directly inside the factory.
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  arrayUnion: vi.fn((val: unknown) => ({ type: 'arrayUnion', val })),
  arrayRemove: vi.fn((val: unknown) => ({ type: 'arrayRemove', val })),
  serverTimestamp: vi.fn(() => 'TIMESTAMP'),
}));

// Get mocked functions after setup
import * as firestoreMock from 'firebase/firestore';

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeSnap(docs: Array<{ id: string; data: Record<string, unknown> }>) {
  return {
    empty: docs.length === 0,
    docs: docs.map((d) => ({
      id: d.id,
      data: () => d.data,
      ref: { id: d.id },
    })),
  };
}

function makeDocSnap(id: string, data: Record<string, unknown> | null) {
  return {
    id,
    exists: () => data !== null,
    data: () => data ?? {},
    ref: { id },
  };
}

// ── Recipe service tests ──────────────────────────────────────────────────────
describe('RecipeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default chaining stubs
    vi.mocked(firestoreMock.collection).mockReturnValue({} as ReturnType<typeof firestoreMock.collection>);
    vi.mocked(firestoreMock.query).mockReturnValue({} as ReturnType<typeof firestoreMock.query>);
    vi.mocked(firestoreMock.where).mockReturnValue({} as ReturnType<typeof firestoreMock.where>);
    vi.mocked(firestoreMock.orderBy).mockReturnValue({} as ReturnType<typeof firestoreMock.orderBy>);
    vi.mocked(firestoreMock.limit).mockReturnValue({} as ReturnType<typeof firestoreMock.limit>);
  });

  it('fetchMyRecipes returns [] when getDocs returns empty snapshots', async () => {
    vi.mocked(firestoreMock.getDocs).mockResolvedValue(makeSnap([]) as Awaited<ReturnType<typeof firestoreMock.getDocs>>);

    const { fetchMyRecipes } = await import('@/services/recipes');
    const result = await fetchMyRecipes('uid-123');
    expect(result).toEqual([]);
  });

  it('fetchMyRecipes deduplicates recipes present in both created and saved queries', async () => {
    const recipe = {
      id: 'r1',
      name: 'Test Recipe',
      createdBy: 'uid-123',
      savedBy: ['uid-123'],
      description: '',
      ingredients: [],
      produce: [],
      cuisine: 'French',
      seasons: ['spring'],
      prepTime: 30,
      servings: 4,
      plants: 1,
      createdByName: 'Test',
      isPublic: false,
    };

    vi.mocked(firestoreMock.getDocs).mockResolvedValue(makeSnap([
      { id: 'r1', data: recipe }
    ]) as Awaited<ReturnType<typeof firestoreMock.getDocs>>);

    const { fetchMyRecipes } = await import('@/services/recipes');
    const result = await fetchMyRecipes('uid-123');
    // Should not have duplicates
    const ids = result.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('createRecipe calls addDoc with correct structure', async () => {
    const mockRef = { id: 'new-recipe-id' };
    vi.mocked(firestoreMock.addDoc).mockResolvedValue(mockRef as Awaited<ReturnType<typeof firestoreMock.addDoc>>);
    vi.mocked(firestoreMock.updateDoc).mockResolvedValue(undefined);

    const { createRecipe } = await import('@/services/recipes');
    const id = await createRecipe(
      {
        name: 'Ratatouille',
        description: 'Classic French dish',
        ingredients: [],
        produce: ['tomato', 'zucchini'],
        cuisine: 'French',
        seasons: ['summer'],
        prepTime: 45,
        servings: 4,
        plants: 2,
        isPublic: false,
        communityScore: undefined,
        ratingCount: undefined,
        imageUrl: undefined,
      },
      'uid-123',
      'Chef User'
    );

    expect(id).toBe('new-recipe-id');
    expect(firestoreMock.addDoc).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(firestoreMock.addDoc).mock.calls[0][1] as Record<string, unknown>;
    expect(callArgs.name).toBe('Ratatouille');
    expect(callArgs.createdBy).toBe('uid-123');
    expect(callArgs.createdByName).toBe('Chef User');
  });
});

// ── Grocery service tests ─────────────────────────────────────────────────────
describe('GroceryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(firestoreMock.collection).mockReturnValue({} as ReturnType<typeof firestoreMock.collection>);
    vi.mocked(firestoreMock.query).mockReturnValue({} as ReturnType<typeof firestoreMock.query>);
  });

  it('fetchGroceryList returns empty array when snap is empty', async () => {
    vi.mocked(firestoreMock.getDocs).mockResolvedValue(makeSnap([]) as Awaited<ReturnType<typeof firestoreMock.getDocs>>);

    const { fetchGroceryList } = await import('@/services/grocery');
    const result = await fetchGroceryList('family-123');
    expect(result).toEqual([]);
  });

  it('fetchGroceryList maps Firestore docs to GroceryItem shape', async () => {
    const doc = {
      id: 'item-1',
      data: {
        name: 'Tomatoes',
        amount: '500g',
        unit: 'g',
        checked: false,
        addedBy: 'uid-123',
        addedByName: 'Test',
      },
    };
    vi.mocked(firestoreMock.getDocs).mockResolvedValue(makeSnap([doc]) as Awaited<ReturnType<typeof firestoreMock.getDocs>>);

    const { fetchGroceryList } = await import('@/services/grocery');
    const result = await fetchGroceryList('family-123');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('item-1');
    expect(result[0].name).toBe('Tomatoes');
  });

  it('toggleGroceryItem calls updateDoc with checked: true', async () => {
    vi.mocked(firestoreMock.doc).mockReturnValue({} as ReturnType<typeof firestoreMock.doc>);
    vi.mocked(firestoreMock.updateDoc).mockResolvedValue(undefined);

    const { toggleGroceryItem } = await import('@/services/grocery');
    await toggleGroceryItem('family-123', 'item-1', true);

    expect(firestoreMock.updateDoc).toHaveBeenCalledWith(expect.anything(), { checked: true });
  });

  it('deleteGroceryItem calls deleteDoc', async () => {
    vi.mocked(firestoreMock.doc).mockReturnValue({} as ReturnType<typeof firestoreMock.doc>);
    vi.mocked(firestoreMock.deleteDoc).mockResolvedValue(undefined);

    const { deleteGroceryItem } = await import('@/services/grocery');
    await deleteGroceryItem('family-123', 'item-1');

    expect(firestoreMock.deleteDoc).toHaveBeenCalledTimes(1);
  });
});

// ── Calendar service tests ────────────────────────────────────────────────────
describe('CalendarService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(firestoreMock.collection).mockReturnValue({} as ReturnType<typeof firestoreMock.collection>);
    vi.mocked(firestoreMock.query).mockReturnValue({} as ReturnType<typeof firestoreMock.query>);
    vi.mocked(firestoreMock.where).mockReturnValue({} as ReturnType<typeof firestoreMock.where>);
  });

  it('getWeekCalendar returns [] for empty dates array', async () => {
    const { getWeekCalendar } = await import('@/services/calendar');
    const result = await getWeekCalendar('family-123', []);
    expect(result).toEqual([]);
    // Should not call Firestore at all
    expect(firestoreMock.getDocs).not.toHaveBeenCalled();
  });

  it('getWeekCalendar maps calendar entries correctly', async () => {
    const entry = {
      id: 'entry-1',
      data: {
        recipeId: 'recipe-1',
        recipeName: 'Pasta',
        mealType: 'dinner',
        date: '2024-03-15',
        addedBy: 'uid-1',
        addedByName: 'User',
      },
    };
    vi.mocked(firestoreMock.getDocs).mockResolvedValue(makeSnap([entry]) as Awaited<ReturnType<typeof firestoreMock.getDocs>>);

    const { getWeekCalendar } = await import('@/services/calendar');
    const result = await getWeekCalendar('family-123', ['2024-03-15']);
    expect(result).toHaveLength(1);
    expect(result[0].recipeId).toBe('recipe-1');
    expect(result[0].mealType).toBe('dinner');
  });
});

// ── Produce service fallback test ─────────────────────────────────────────────
describe('ProduceService (Firestore fallback)', () => {
  it('fetchProduceBySeason falls back to catalogue when Firestore fails', async () => {
    vi.mocked(firestoreMock.getDocs).mockRejectedValue(new Error('Firestore unavailable'));
    vi.mocked(firestoreMock.collection).mockReturnValue({} as ReturnType<typeof firestoreMock.collection>);
    vi.mocked(firestoreMock.query).mockReturnValue({} as ReturnType<typeof firestoreMock.query>);
    vi.mocked(firestoreMock.where).mockReturnValue({} as ReturnType<typeof firestoreMock.where>);

    const { fetchProduceBySeason } = await import('@/services/produce');
    const result = await fetchProduceBySeason('spring');
    expect(result.length).toBeGreaterThan(0);
    // All returned items should be spring produce
    for (const p of result) {
      expect(p.seasons).toContain('spring');
    }
  });
});

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { getDb, getFirebaseAuth } from '@/lib/firebase';
import type { Recipe, Ingredient } from '@/types';

/** Ensure the Firestore auth token is ready before making queries */
async function ensureAuth(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    await auth.authStateReady();
  }
}

/* Normalize Firestore doc data to handle field name differences between web and iOS */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRecipe(id: string, d: Record<string, any>): Recipe {
  return {
    id,
    name: d.name || d.title || '',
    description: d.description || '',
    ingredients: (d.ingredients || []).map((i: Record<string, unknown>) => ({
      name: (i.name as string) || '',
      amount: (i.amount as string) || (i.quantity as string) || '',
      unit: (i.unit as string) || '',
    } as Ingredient)),
    produce: d.produce || [],
    cuisine: d.cuisine || d.cuisineId || '',
    seasons: d.seasons || [],
    prepTime: d.prepTime ?? d.prepMinutes ?? 0,
    servings: d.servings ?? 4,
    plants: d.plants ?? (d.produce?.length || 0),
    createdBy: d.createdBy || '',
    createdByName: d.createdByName || '',
    isPublic: d.isPublic || false,
    savedBy: d.savedBy || d.starredBy || [],
    communityScore: d.communityScore ?? 0,
    ratingCount: d.ratingCount ?? 0,
    steps: d.steps || d.instructions || [],
    imageUrl: d.imageUrl || d.imageURL || undefined,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt ?? undefined,
  };
}

export async function fetchMyRecipes(uid: string): Promise<Recipe[]> {
  const db = getDb();
  const col = collection(db, 'recipes');

  const [createdSnap, savedSnap] = await Promise.all([
    getDocs(query(col, where('createdBy', '==', uid))),
    getDocs(query(col, where('savedBy', 'array-contains', uid))),
  ]);

  const map = new Map<string, Recipe>();
  for (const d of createdSnap.docs) {
    map.set(d.id, toRecipe(d.id, d.data()));
  }
  for (const d of savedSnap.docs) {
    if (!map.has(d.id)) {
      map.set(d.id, toRecipe(d.id, d.data()));
    }
  }
  return Array.from(map.values());
}

export async function fetchCommunityRecipes(
  filter?: { season?: string; cuisine?: string }
): Promise<Recipe[]> {
  const db = getDb();
  const col = collection(db, 'recipes');
  const constraints = [where('isPublic', '==', true)];

  if (filter?.season) {
    constraints.push(where('seasons', 'array-contains', filter.season));
  }
  if (filter?.cuisine) {
    constraints.push(where('cuisine', '==', filter.cuisine));
  }

  const snap = await getDocs(query(col, ...constraints));
  return snap.docs.map((d) => toRecipe(d.id, d.data()));
}

export async function fetchFamilyRecipes(familyId: string): Promise<Recipe[]> {
  if (!familyId) return [];
  await ensureAuth();
  const db = getDb();
  const snap = await getDocs(
    query(collection(db, 'recipes'), where('familyId', '==', familyId))
  );
  return snap.docs.map((d) => toRecipe(d.id, d.data()));
}

export async function fetchRecipe(id: string): Promise<Recipe | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, 'recipes', id));
  if (!snap.exists()) return null;
  return toRecipe(snap.id, snap.data());
}

export async function fetchRecipesByIds(ids: string[]): Promise<Recipe[]> {
  if (ids.length === 0) return [];
  const db = getDb();
  const results: Recipe[] = [];
  // Firestore 'in' queries limited to 30, batch accordingly
  const batches = [];
  for (let i = 0; i < ids.length; i += 30) {
    batches.push(ids.slice(i, i + 30));
  }
  for (const batch of batches) {
    const snap = await getDocs(
      query(collection(db, 'recipes'), where('__name__', 'in', batch))
    );
    for (const d of snap.docs) {
      results.push(toRecipe(d.id, d.data()));
    }
  }
  return results;
}

export async function createRecipe(
  data: Omit<Recipe, 'id' | 'createdAt' | 'savedBy' | 'communityScore' | 'ratingCount'>,
  uid: string,
  displayName: string,
  familyId?: string
): Promise<string> {
  const db = getDb();
  const docData: Record<string, unknown> = {
    ...data,
    title: data.name,
    createdBy: uid,
    createdByName: displayName,
    instructions: data.steps || [],
    prepMinutes: data.prepTime,
    savedBy: [],
    starredBy: [],
    communityScore: 0,
    ratingCount: 0,
    createdAt: serverTimestamp(),
  };
  if (familyId) {
    docData.familyId = familyId;
  }
  const ref = await addDoc(collection(db, 'recipes'), docData);
  return ref.id;
}

export async function updateRecipe(
  id: string,
  uid: string,
  data: Partial<Recipe>
): Promise<void> {
  const db = getDb();
  const ref = doc(db, 'recipes', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Recipe not found');
  if (snap.data().createdBy !== uid) throw new Error('Not the recipe owner');
  await updateDoc(ref, data);
}

export async function deleteRecipe(id: string, uid: string): Promise<void> {
  const db = getDb();
  const ref = doc(db, 'recipes', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Recipe not found');
  if (snap.data().createdBy !== uid) throw new Error('Not the recipe owner');
  await deleteDoc(ref);
}

export async function saveRecipe(recipeId: string, uid: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, 'recipes', recipeId), {
    savedBy: arrayUnion(uid),
  });
}

export async function unsaveRecipe(recipeId: string, uid: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, 'recipes', recipeId), {
    savedBy: arrayRemove(uid),
  });
}

export async function toggleStarRecipe(uid: string, recipeId: string): Promise<boolean> {
  const db = getDb();
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error('User not found');
  const starred: string[] = snap.data().starredRecipes || [];
  const isStarred = starred.includes(recipeId);
  await updateDoc(userRef, {
    starredRecipes: isStarred ? arrayRemove(recipeId) : arrayUnion(recipeId),
  });
  return !isStarred;
}

export async function getStarredIds(uid: string): Promise<string[]> {
  const db = getDb();
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return [];
  return snap.data().starredRecipes || [];
}

export async function rateRecipe(
  uid: string,
  recipeId: string,
  score: number
): Promise<void> {
  const db = getDb();
  const ratingRef = doc(db, 'recipes', recipeId, 'ratings', uid);
  await setDoc(ratingRef, { score, updatedAt: serverTimestamp() });

  // Recompute average
  const ratingsSnap = await getDocs(collection(db, 'recipes', recipeId, 'ratings'));
  let total = 0;
  let count = 0;
  for (const d of ratingsSnap.docs) {
    total += d.data().score;
    count++;
  }
  await updateDoc(doc(db, 'recipes', recipeId), {
    communityScore: count > 0 ? total / count : 0,
    ratingCount: count,
  });
}

export async function getUserRating(
  uid: string,
  recipeId: string
): Promise<number | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, 'recipes', recipeId, 'ratings', uid));
  if (!snap.exists()) return null;
  return snap.data().score;
}

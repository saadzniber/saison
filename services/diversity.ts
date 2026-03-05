import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { WeeklyDiversity } from '@/types';
import { getWeekId } from '@/types';

export async function fetchWeeklyDiversity(
  familyId: string,
  weekId: string
): Promise<WeeklyDiversity | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, 'families', familyId, 'diversity', weekId));
  if (!snap.exists()) return null;
  return { weekId: snap.id, ...snap.data() } as WeeklyDiversity;
}

export async function logMealProduce(
  familyId: string,
  weekId: string,
  produce: string[]
): Promise<void> {
  const db = getDb();
  const ref = doc(db, 'families', familyId, 'diversity', weekId);
  const snap = await getDoc(ref);

  const existing: Record<string, number> = snap.exists()
    ? snap.data().produce || {}
    : {};

  for (const p of produce) {
    const key = p.toLowerCase();
    if (!existing[key]) {
      existing[key] = 1;
    }
    // Don't double-count same plant in same week
  }

  const score = computeScore(existing);
  await setDoc(ref, {
    weekId,
    produce: existing,
    score,
    updatedAt: serverTimestamp(),
  });
}

export function computeScore(produce: Record<string, number>): number {
  const uniqueCount = Object.keys(produce).length;
  return Math.min(100, Math.round(uniqueCount * 3.33));
}

/**
 * Recalculate diversity for the week containing the given date.
 * Reads all calendar entries for that week, looks up each recipe's produce,
 * and rebuilds the diversity document.
 */
export async function recalculateWeekDiversity(
  familyId: string,
  entryDate: string
): Promise<void> {
  const db = getDb();
  const mealDate = new Date(entryDate + 'T12:00:00');
  const weekId = getWeekId(mealDate);

  // Get all dates in this week
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  // Calculate the Monday of the week containing entryDate
  const d = new Date(mealDate);
  const dow = d.getDay();
  const entryMondayOffset = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + entryMondayOffset);
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    weekDates.push(day.toISOString().split('T')[0]);
  }

  // Fetch calendar entries for these dates (Firestore 'in' supports up to 30)
  const calCol = collection(db, 'families', familyId, 'calendar');
  const snap = await getDocs(query(calCol, where('date', 'in', weekDates)));
  const recipeIds = [...new Set(snap.docs.map((d) => d.data().recipeId as string))];

  // Fetch recipes to get their produce
  const produce: Record<string, number> = {};
  if (recipeIds.length > 0) {
    const recipesCol = collection(db, 'recipes');
    // Firestore 'in' limit is 30, batch if needed
    for (let i = 0; i < recipeIds.length; i += 30) {
      const batch = recipeIds.slice(i, i + 30);
      const recipeSnap = await getDocs(query(recipesCol, where('__name__', 'in', batch)));
      for (const rdoc of recipeSnap.docs) {
        const data = rdoc.data();
        const plants = (data.produce as string[]) || [];
        for (const p of plants) {
          const key = p.toLowerCase();
          if (!produce[key]) produce[key] = 1;
        }
      }
    }
  }

  const ref = doc(db, 'families', familyId, 'diversity', weekId);
  const score = computeScore(produce);
  await setDoc(ref, {
    weekId,
    produce,
    score,
    updatedAt: serverTimestamp(),
  });
}

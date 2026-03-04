import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { WeeklyDiversity } from '@/types';

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

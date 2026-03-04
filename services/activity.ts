import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { ActivityItem } from '@/types';

export async function fetchActivity(
  familyId: string,
  limit = 20
): Promise<ActivityItem[]> {
  const db = getDb();
  const col = collection(db, 'families', familyId, 'activity');
  const q = query(col, orderBy('createdAt', 'desc'), firestoreLimit(limit));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as ActivityItem;
  });
}

export async function logActivity(
  familyId: string,
  item: Omit<ActivityItem, 'id' | 'createdAt'>
): Promise<void> {
  const db = getDb();
  await addDoc(collection(db, 'families', familyId, 'activity'), {
    ...item,
    createdAt: serverTimestamp(),
  });
}

export function formatTimeAgo(date: Date): { key: string; params?: { n: number } } {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return { key: 'time.justNow' };
  if (diffMin < 60) return { key: 'time.minutesAgo', params: { n: diffMin } };
  if (diffHour < 24) return { key: 'time.hoursAgo', params: { n: diffHour } };
  if (diffDay < 7) return { key: 'time.daysAgo', params: { n: diffDay } };
  return { key: 'time.weeksAgo', params: { n: diffWeek } };
}

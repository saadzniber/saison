import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { CalendarEntry, MealType } from '@/types';

export async function getWeekCalendar(
  familyId: string,
  dates: string[]
): Promise<CalendarEntry[]> {
  if (dates.length === 0) return [];
  const db = getDb();
  const col = collection(db, 'families', familyId, 'calendar');
  const snap = await getDocs(query(col, where('date', 'in', dates)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEntry));
}

export async function addToCalendar(
  familyId: string,
  entry: Omit<CalendarEntry, 'id'>
): Promise<void> {
  const db = getDb();
  const docId = `${entry.date}_${entry.mealType}`;
  await setDoc(doc(db, 'families', familyId, 'calendar', docId), {
    ...entry,
  });
}

export function listenToWeekCalendar(
  familyId: string,
  dates: string[],
  onChange: (entries: CalendarEntry[]) => void
): Unsubscribe {
  if (dates.length === 0) {
    onChange([]);
    return () => {};
  }
  const db = getDb();
  const col = collection(db, 'families', familyId, 'calendar');
  return onSnapshot(query(col, where('date', 'in', dates)), (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEntry)));
  });
}

export async function removeFromCalendar(
  familyId: string,
  date: string,
  mealType: MealType
): Promise<void> {
  const db = getDb();
  const docId = `${date}_${mealType}`;
  await deleteDoc(doc(db, 'families', familyId, 'calendar', docId));
}

export async function fetchAllCalendarEntries(
  familyId: string
): Promise<CalendarEntry[]> {
  const db = getDb();
  const col = collection(db, 'families', familyId, 'calendar');
  const snap = await getDocs(query(col));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEntry));
}

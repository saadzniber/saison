import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { GroceryItem } from '@/types';

export async function fetchGroceryList(familyId: string): Promise<GroceryItem[]> {
  const db = getDb();
  const snap = await getDocs(collection(db, 'families', familyId, 'grocery'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GroceryItem));
}

export async function addToGrocery(
  familyId: string,
  items: Omit<GroceryItem, 'id'>[]
): Promise<void> {
  if (items.length === 0) return;
  const db = getDb();
  const col = collection(db, 'families', familyId, 'grocery');

  // Fetch existing to skip duplicates
  const existing = await getDocs(col);
  const existingNames = new Set(
    existing.docs.map((d) => (d.data().name as string).toLowerCase())
  );

  for (const item of items) {
    if (!existingNames.has(item.name.toLowerCase())) {
      await addDoc(col, item);
      existingNames.add(item.name.toLowerCase());
    }
  }
}

export async function toggleGroceryItem(
  familyId: string,
  itemId: string,
  checked: boolean
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, 'families', familyId, 'grocery', itemId), { checked });
}

export async function clearCheckedItems(familyId: string): Promise<void> {
  const db = getDb();
  const col = collection(db, 'families', familyId, 'grocery');
  const snap = await getDocs(query(col, where('checked', '==', true)));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function deleteGroceryItem(
  familyId: string,
  itemId: string
): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, 'families', familyId, 'grocery', itemId));
}

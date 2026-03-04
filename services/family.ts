import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { Family, User } from '@/types';

export async function getUserFamily(uid: string): Promise<Family | null> {
  const db = getDb();
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) return null;
  const familyId = userSnap.data().familyId;
  if (!familyId) return null;
  const familySnap = await getDoc(doc(db, 'families', familyId));
  if (!familySnap.exists()) return null;
  return { id: familySnap.id, ...familySnap.data() } as Family;
}

function randomCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createFamily(
  name: string,
  uid: string,
  displayName: string
): Promise<Family> {
  const db = getDb();
  const code = randomCode();

  const familyRef = await addDoc(collection(db, 'families'), {
    name,
    memberIds: [uid],
    adminId: uid,
    inviteCode: code,
    createdAt: serverTimestamp(),
  });

  // Create the invite doc
  await setDoc(doc(db, 'invites', code), {
    code,
    familyId: familyRef.id,
    familyName: name,
    createdBy: uid,
    createdAt: serverTimestamp(),
  });

  // Update user
  await updateDoc(doc(db, 'users', uid), { familyId: familyRef.id });

  return {
    id: familyRef.id,
    name,
    memberIds: [uid],
    adminId: uid,
    inviteCode: code,
  };
}

export async function joinFamily(
  code: string,
  uid: string,
  displayName: string
): Promise<Family> {
  const db = getDb();
  const inviteSnap = await getDoc(doc(db, 'invites', code));
  if (!inviteSnap.exists()) throw new Error('Invalid invite code');

  const { familyId } = inviteSnap.data();
  const familyRef = doc(db, 'families', familyId);
  const familySnap = await getDoc(familyRef);
  if (!familySnap.exists()) throw new Error('Family not found');

  await updateDoc(familyRef, { memberIds: arrayUnion(uid) });
  await updateDoc(doc(db, 'users', uid), { familyId });

  const data = familySnap.data();
  return {
    id: familyId,
    name: data.name,
    memberIds: [...data.memberIds, uid],
    adminId: data.adminId,
    inviteCode: data.inviteCode,
  };
}

export async function generateInviteCode(
  familyId: string,
  uid: string
): Promise<string> {
  const db = getDb();
  const familySnap = await getDoc(doc(db, 'families', familyId));
  if (!familySnap.exists()) throw new Error('Family not found');

  const code = randomCode();
  await setDoc(doc(db, 'invites', code), {
    code,
    familyId,
    familyName: familySnap.data().name,
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'families', familyId), { inviteCode: code });
  return code;
}

export async function getInviteInfo(
  code: string
): Promise<{ familyId: string; familyName: string } | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, 'invites', code));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { familyId: data.familyId, familyName: data.familyName };
}

export async function leaveFamily(familyId: string, uid: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, 'families', familyId), {
    memberIds: arrayRemove(uid),
  });
  await updateDoc(doc(db, 'users', uid), { familyId: '' });
}

export async function getFamilyMembers(familyId: string): Promise<User[]> {
  const db = getDb();
  const familySnap = await getDoc(doc(db, 'families', familyId));
  if (!familySnap.exists()) return [];
  const memberIds: string[] = familySnap.data().memberIds || [];
  if (memberIds.length === 0) return [];

  const members: User[] = [];
  // Firestore 'in' limited to 30
  for (let i = 0; i < memberIds.length; i += 30) {
    const batch = memberIds.slice(i, i + 30);
    const snap = await getDocs(
      query(collection(db, 'users'), where('__name__', 'in', batch))
    );
    for (const d of snap.docs) {
      members.push({ uid: d.id, ...d.data() } as User);
    }
  }
  return members;
}

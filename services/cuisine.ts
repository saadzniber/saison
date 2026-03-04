import { collection, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { Cuisine } from '@/types';

export const CUISINE_LIST: Cuisine[] = [
  { id: 'french', name: { en: 'French', fr: 'Francaise' }, emoji: '🇫🇷' },
  { id: 'italian', name: { en: 'Italian', fr: 'Italienne' }, emoji: '🇮🇹' },
  { id: 'japanese', name: { en: 'Japanese', fr: 'Japonaise' }, emoji: '🇯🇵' },
  { id: 'chinese', name: { en: 'Chinese', fr: 'Chinoise' }, emoji: '🇨🇳' },
  { id: 'indian', name: { en: 'Indian', fr: 'Indienne' }, emoji: '🇮🇳' },
  { id: 'mexican', name: { en: 'Mexican', fr: 'Mexicaine' }, emoji: '🇲🇽' },
  { id: 'mediterranean', name: { en: 'Mediterranean', fr: 'Mediterraneenne' }, emoji: '🫒' },
  { id: 'middle-eastern', name: { en: 'Middle Eastern', fr: 'Moyen-orientale' }, emoji: '🧆' },
  { id: 'american', name: { en: 'American', fr: 'Americaine' }, emoji: '🇺🇸' },
  { id: 'thai', name: { en: 'Thai', fr: 'Thailandaise' }, emoji: '🇹🇭' },
  { id: 'greek', name: { en: 'Greek', fr: 'Grecque' }, emoji: '🇬🇷' },
  { id: 'moroccan', name: { en: 'Moroccan', fr: 'Marocaine' }, emoji: '🇲🇦' },
  { id: 'lebanese', name: { en: 'Lebanese', fr: 'Libanaise' }, emoji: '🇱🇧' },
  { id: 'spanish', name: { en: 'Spanish', fr: 'Espagnole' }, emoji: '🇪🇸' },
  { id: 'vietnamese', name: { en: 'Vietnamese', fr: 'Vietnamienne' }, emoji: '🇻🇳' },
  { id: 'korean', name: { en: 'Korean', fr: 'Coreenne' }, emoji: '🇰🇷' },
  { id: 'british', name: { en: 'British', fr: 'Britannique' }, emoji: '🇬🇧' },
  { id: 'nordic', name: { en: 'Nordic', fr: 'Nordique' }, emoji: '🇸🇪' },
  { id: 'asian', name: { en: 'Asian', fr: 'Asiatique' }, emoji: '🥢' },
];

export async function fetchCuisines(): Promise<Cuisine[]> {
  try {
    const db = getDb();
    const snap = await getDocs(collection(db, 'cuisines'));
    if (snap.empty) return CUISINE_LIST;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cuisine));
  } catch {
    return CUISINE_LIST;
  }
}

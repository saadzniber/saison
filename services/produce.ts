import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { Produce, Season } from '@/types';

export const PRODUCE_CATALOGUE: Produce[] = [
  // ── Spring ──
  { id: 'asparagus', name: { en: 'Asparagus', fr: 'Asperge' }, emoji: '🌱', type: 'vegetable', seasons: ['spring'] },
  { id: 'artichoke', name: { en: 'Artichoke', fr: 'Artichaut' }, emoji: '🌿', type: 'vegetable', seasons: ['spring'] },
  { id: 'pea', name: { en: 'Pea', fr: 'Petit pois' }, emoji: '🟢', type: 'vegetable', seasons: ['spring'] },
  { id: 'radish', name: { en: 'Radish', fr: 'Radis' }, emoji: '🔴', type: 'vegetable', seasons: ['spring'] },
  { id: 'spinach', name: { en: 'Spinach', fr: 'Epinard' }, emoji: '🥬', type: 'vegetable', seasons: ['spring'] },
  { id: 'watercress', name: { en: 'Watercress', fr: 'Cresson' }, emoji: '🌿', type: 'vegetable', seasons: ['spring'] },
  { id: 'rhubarb', name: { en: 'Rhubarb', fr: 'Rhubarbe' }, emoji: '🌱', type: 'vegetable', seasons: ['spring'] },
  { id: 'spring-onion', name: { en: 'Spring Onion', fr: 'Oignon nouveau' }, emoji: '🧅', type: 'vegetable', seasons: ['spring'] },
  { id: 'fava-bean', name: { en: 'Fava Bean', fr: 'Feve' }, emoji: '🫘', type: 'legume', seasons: ['spring'] },
  { id: 'strawberry', name: { en: 'Strawberry', fr: 'Fraise' }, emoji: '🍓', type: 'fruit', seasons: ['spring', 'summer'] },
  { id: 'cherry', name: { en: 'Cherry', fr: 'Cerise' }, emoji: '🍒', type: 'fruit', seasons: ['spring', 'summer'] },
  { id: 'sorrel', name: { en: 'Sorrel', fr: 'Oseille' }, emoji: '🍃', type: 'herb', seasons: ['spring'] },

  // ── Summer ──
  { id: 'tomato', name: { en: 'Tomato', fr: 'Tomate' }, emoji: '🍅', type: 'vegetable', seasons: ['summer'] },
  { id: 'zucchini', name: { en: 'Zucchini', fr: 'Courgette' }, emoji: '🥒', type: 'vegetable', seasons: ['summer'] },
  { id: 'eggplant', name: { en: 'Eggplant', fr: 'Aubergine' }, emoji: '🍆', type: 'vegetable', seasons: ['summer'] },
  { id: 'bell-pepper', name: { en: 'Bell Pepper', fr: 'Poivron' }, emoji: '🫑', type: 'vegetable', seasons: ['summer'] },
  { id: 'cucumber', name: { en: 'Cucumber', fr: 'Concombre' }, emoji: '🥒', type: 'vegetable', seasons: ['summer'] },
  { id: 'corn', name: { en: 'Corn', fr: 'Mais' }, emoji: '🌽', type: 'grain', seasons: ['summer'] },
  { id: 'green-bean', name: { en: 'Green Bean', fr: 'Haricot vert' }, emoji: '🫛', type: 'vegetable', seasons: ['summer'] },
  { id: 'peach', name: { en: 'Peach', fr: 'Peche' }, emoji: '🍑', type: 'fruit', seasons: ['summer'] },
  { id: 'apricot', name: { en: 'Apricot', fr: 'Abricot' }, emoji: '🍑', type: 'fruit', seasons: ['summer'] },
  { id: 'melon', name: { en: 'Melon', fr: 'Melon' }, emoji: '🍈', type: 'fruit', seasons: ['summer'] },
  { id: 'watermelon', name: { en: 'Watermelon', fr: 'Pasteque' }, emoji: '🍉', type: 'fruit', seasons: ['summer'] },
  { id: 'fig', name: { en: 'Fig', fr: 'Figue' }, emoji: '🟤', type: 'fruit', seasons: ['summer', 'autumn'] },
  { id: 'raspberry', name: { en: 'Raspberry', fr: 'Framboise' }, emoji: '🫐', type: 'fruit', seasons: ['summer'] },
  { id: 'blueberry', name: { en: 'Blueberry', fr: 'Myrtille' }, emoji: '🫐', type: 'fruit', seasons: ['summer'] },
  { id: 'blackberry', name: { en: 'Blackberry', fr: 'Mure' }, emoji: '🫐', type: 'fruit', seasons: ['summer', 'autumn'] },
  { id: 'plum', name: { en: 'Plum', fr: 'Prune' }, emoji: '🟣', type: 'fruit', seasons: ['summer'] },
  { id: 'nectarine', name: { en: 'Nectarine', fr: 'Nectarine' }, emoji: '🍑', type: 'fruit', seasons: ['summer'] },
  { id: 'fennel', name: { en: 'Fennel', fr: 'Fenouil' }, emoji: '🌿', type: 'vegetable', seasons: ['summer', 'autumn'] },
  { id: 'basil', name: { en: 'Basil', fr: 'Basilic' }, emoji: '🌿', type: 'herb', seasons: ['summer'] },
  { id: 'mint', name: { en: 'Mint', fr: 'Menthe' }, emoji: '🌿', type: 'herb', seasons: ['summer'] },
  { id: 'cilantro', name: { en: 'Cilantro', fr: 'Coriandre' }, emoji: '🌿', type: 'herb', seasons: ['summer'] },

  // ── Autumn ──
  { id: 'pumpkin', name: { en: 'Pumpkin', fr: 'Citrouille' }, emoji: '🎃', type: 'vegetable', seasons: ['autumn'] },
  { id: 'butternut-squash', name: { en: 'Butternut Squash', fr: 'Courge butternut' }, emoji: '🎃', type: 'vegetable', seasons: ['autumn'] },
  { id: 'sweet-potato', name: { en: 'Sweet Potato', fr: 'Patate douce' }, emoji: '🍠', type: 'vegetable', seasons: ['autumn', 'winter'] },
  { id: 'apple', name: { en: 'Apple', fr: 'Pomme' }, emoji: '🍎', type: 'fruit', seasons: ['autumn'] },
  { id: 'pear', name: { en: 'Pear', fr: 'Poire' }, emoji: '🍐', type: 'fruit', seasons: ['autumn'] },
  { id: 'grape', name: { en: 'Grape', fr: 'Raisin' }, emoji: '🍇', type: 'fruit', seasons: ['autumn'] },
  { id: 'quince', name: { en: 'Quince', fr: 'Coing' }, emoji: '🍐', type: 'fruit', seasons: ['autumn'] },
  { id: 'chestnut', name: { en: 'Chestnut', fr: 'Chataigne' }, emoji: '🌰', type: 'nut', seasons: ['autumn'] },
  { id: 'walnut', name: { en: 'Walnut', fr: 'Noix' }, emoji: '🥜', type: 'nut', seasons: ['autumn'] },
  { id: 'hazelnut', name: { en: 'Hazelnut', fr: 'Noisette' }, emoji: '🌰', type: 'nut', seasons: ['autumn'] },
  { id: 'brussels-sprout', name: { en: 'Brussels Sprout', fr: 'Chou de Bruxelles' }, emoji: '🥬', type: 'vegetable', seasons: ['autumn', 'winter'] },
  { id: 'cauliflower', name: { en: 'Cauliflower', fr: 'Chou-fleur' }, emoji: '🥦', type: 'vegetable', seasons: ['autumn', 'winter'] },
  { id: 'broccoli', name: { en: 'Broccoli', fr: 'Brocoli' }, emoji: '🥦', type: 'vegetable', seasons: ['autumn'] },
  { id: 'celery', name: { en: 'Celery', fr: 'Celeri' }, emoji: '🌿', type: 'vegetable', seasons: ['autumn'] },
  { id: 'celeriac', name: { en: 'Celeriac', fr: 'Celeri-rave' }, emoji: '🌿', type: 'vegetable', seasons: ['autumn', 'winter'] },
  { id: 'turnip', name: { en: 'Turnip', fr: 'Navet' }, emoji: '🥔', type: 'vegetable', seasons: ['autumn', 'winter'] },
  { id: 'parsnip', name: { en: 'Parsnip', fr: 'Panais' }, emoji: '🥕', type: 'vegetable', seasons: ['autumn', 'winter'] },
  { id: 'mushroom', name: { en: 'Mushroom', fr: 'Champignon' }, emoji: '🍄', type: 'vegetable', seasons: ['autumn'] },
  { id: 'cranberry', name: { en: 'Cranberry', fr: 'Canneberge' }, emoji: '🔴', type: 'fruit', seasons: ['autumn'] },
  { id: 'pomegranate', name: { en: 'Pomegranate', fr: 'Grenade' }, emoji: '🔴', type: 'fruit', seasons: ['autumn'] },
  { id: 'persimmon', name: { en: 'Persimmon', fr: 'Kaki' }, emoji: '🟠', type: 'fruit', seasons: ['autumn'] },

  // ── Winter ──
  { id: 'orange', name: { en: 'Orange', fr: 'Orange' }, emoji: '🍊', type: 'fruit', seasons: ['winter'] },
  { id: 'clementine', name: { en: 'Clementine', fr: 'Clementine' }, emoji: '🍊', type: 'fruit', seasons: ['winter'] },
  { id: 'grapefruit', name: { en: 'Grapefruit', fr: 'Pamplemousse' }, emoji: '🍊', type: 'fruit', seasons: ['winter'] },
  { id: 'lemon', name: { en: 'Lemon', fr: 'Citron' }, emoji: '🍋', type: 'fruit', seasons: ['winter', 'spring'] },
  { id: 'kiwi', name: { en: 'Kiwi', fr: 'Kiwi' }, emoji: '🥝', type: 'fruit', seasons: ['winter'] },
  { id: 'endive', name: { en: 'Endive', fr: 'Endive' }, emoji: '🥬', type: 'vegetable', seasons: ['winter'] },
  { id: 'kale', name: { en: 'Kale', fr: 'Chou frise' }, emoji: '🥬', type: 'vegetable', seasons: ['winter'] },
  { id: 'leek', name: { en: 'Leek', fr: 'Poireau' }, emoji: '🌿', type: 'vegetable', seasons: ['winter'] },
  { id: 'cabbage', name: { en: 'Cabbage', fr: 'Chou' }, emoji: '🥬', type: 'vegetable', seasons: ['winter'] },
  { id: 'rutabaga', name: { en: 'Rutabaga', fr: 'Rutabaga' }, emoji: '🥔', type: 'vegetable', seasons: ['winter'] },
  { id: 'salsify', name: { en: 'Salsify', fr: 'Salsifis' }, emoji: '🌿', type: 'vegetable', seasons: ['winter'] },
  { id: 'jerusalem-artichoke', name: { en: 'Jerusalem Artichoke', fr: 'Topinambour' }, emoji: '🥔', type: 'vegetable', seasons: ['winter'] },
  { id: 'blood-orange', name: { en: 'Blood Orange', fr: 'Orange sanguine' }, emoji: '🍊', type: 'fruit', seasons: ['winter'] },
  { id: 'mandarin', name: { en: 'Mandarin', fr: 'Mandarine' }, emoji: '🍊', type: 'fruit', seasons: ['winter'] },

  // ── Year-round ──
  { id: 'garlic', name: { en: 'Garlic', fr: 'Ail' }, emoji: '🧄', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'onion', name: { en: 'Onion', fr: 'Oignon' }, emoji: '🧅', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'potato', name: { en: 'Potato', fr: 'Pomme de terre' }, emoji: '🥔', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'carrot', name: { en: 'Carrot', fr: 'Carotte' }, emoji: '🥕', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'shallot', name: { en: 'Shallot', fr: 'Echalote' }, emoji: '🧅', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'lettuce', name: { en: 'Lettuce', fr: 'Laitue' }, emoji: '🥬', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'beetroot', name: { en: 'Beetroot', fr: 'Betterave' }, emoji: '🟣', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'avocado', name: { en: 'Avocado', fr: 'Avocat' }, emoji: '🥑', type: 'fruit', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'banana', name: { en: 'Banana', fr: 'Banane' }, emoji: '🍌', type: 'fruit', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'ginger', name: { en: 'Ginger', fr: 'Gingembre' }, emoji: '🫚', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'parsley', name: { en: 'Parsley', fr: 'Persil' }, emoji: '🌿', type: 'herb', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'thyme', name: { en: 'Thyme', fr: 'Thym' }, emoji: '🌿', type: 'herb', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'rosemary', name: { en: 'Rosemary', fr: 'Romarin' }, emoji: '🌿', type: 'herb', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'chive', name: { en: 'Chive', fr: 'Ciboulette' }, emoji: '🌿', type: 'herb', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'lentil', name: { en: 'Lentil', fr: 'Lentille' }, emoji: '🫘', type: 'legume', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'chickpea', name: { en: 'Chickpea', fr: 'Pois chiche' }, emoji: '🫘', type: 'legume', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'white-bean', name: { en: 'White Bean', fr: 'Haricot blanc' }, emoji: '🫘', type: 'legume', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'rice', name: { en: 'Rice', fr: 'Riz' }, emoji: '🍚', type: 'grain', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'quinoa', name: { en: 'Quinoa', fr: 'Quinoa' }, emoji: '🌾', type: 'grain', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'oat', name: { en: 'Oat', fr: 'Avoine' }, emoji: '🌾', type: 'grain', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'almond', name: { en: 'Almond', fr: 'Amande' }, emoji: '🥜', type: 'nut', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'coconut', name: { en: 'Coconut', fr: 'Noix de coco' }, emoji: '🥥', type: 'nut', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'pineapple', name: { en: 'Pineapple', fr: 'Ananas' }, emoji: '🍍', type: 'fruit', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'mango', name: { en: 'Mango', fr: 'Mangue' }, emoji: '🥭', type: 'fruit', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'lime', name: { en: 'Lime', fr: 'Citron vert' }, emoji: '🍋', type: 'fruit', seasons: ['spring', 'summer', 'autumn', 'winter'] },
];

export async function fetchProduceBySeason(season: string): Promise<Produce[]> {
  const normalized = season.toLowerCase() as Season;
  try {
    const db = getDb();
    const snap = await getDocs(
      query(
        collection(db, 'produce'),
        where('seasons', 'array-contains', normalized)
      )
    );
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Produce));
    }
  } catch {
    // Fall back to catalogue
  }
  return PRODUCE_CATALOGUE.filter((p) => p.seasons.includes(normalized));
}

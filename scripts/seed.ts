import * as admin from 'firebase-admin';

// Initialize with project ID (uses ADC or GOOGLE_APPLICATION_CREDENTIALS)
admin.initializeApp({ projectId: 'weekeat-d5bc7' });
const db = admin.firestore();

// ─── Cuisines ────────────────────────────────────────────────────────────────

interface Cuisine {
  name: { en: string; fr: string };
  emoji: string;
}

const cuisines: Record<string, Cuisine> = {
  french: { name: { en: 'French', fr: 'Francaise' }, emoji: '🇫🇷' },
  italian: { name: { en: 'Italian', fr: 'Italienne' }, emoji: '🇮🇹' },
  japanese: { name: { en: 'Japanese', fr: 'Japonaise' }, emoji: '🇯🇵' },
  chinese: { name: { en: 'Chinese', fr: 'Chinoise' }, emoji: '🇨🇳' },
  indian: { name: { en: 'Indian', fr: 'Indienne' }, emoji: '🇮🇳' },
  mexican: { name: { en: 'Mexican', fr: 'Mexicaine' }, emoji: '🇲🇽' },
  thai: { name: { en: 'Thai', fr: 'Thailandaise' }, emoji: '🇹🇭' },
  korean: { name: { en: 'Korean', fr: 'Coreenne' }, emoji: '🇰🇷' },
  vietnamese: { name: { en: 'Vietnamese', fr: 'Vietnamienne' }, emoji: '🇻🇳' },
  moroccan: { name: { en: 'Moroccan', fr: 'Marocaine' }, emoji: '🇲🇦' },
  lebanese: { name: { en: 'Lebanese', fr: 'Libanaise' }, emoji: '🇱🇧' },
  greek: { name: { en: 'Greek', fr: 'Grecque' }, emoji: '🇬🇷' },
  spanish: { name: { en: 'Spanish', fr: 'Espagnole' }, emoji: '🇪🇸' },
  turkish: { name: { en: 'Turkish', fr: 'Turque' }, emoji: '🇹🇷' },
  ethiopian: { name: { en: 'Ethiopian', fr: 'Ethiopienne' }, emoji: '🇪🇹' },
  peruvian: { name: { en: 'Peruvian', fr: 'Peruvienne' }, emoji: '🇵🇪' },
  american: { name: { en: 'American', fr: 'Americaine' }, emoji: '🇺🇸' },
  british: { name: { en: 'British', fr: 'Britannique' }, emoji: '🇬🇧' },
  caribbean: { name: { en: 'Caribbean', fr: 'Antillaise' }, emoji: '🏝️' },
};

// ─── Produce ─────────────────────────────────────────────────────────────────

type ProduceType = 'vegetable' | 'fruit' | 'herb' | 'legume' | 'grain';
type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface ProduceItem {
  name: { en: string; fr: string };
  emoji: string;
  type: ProduceType;
  seasons: Season[];
}

const produce: Record<string, ProduceItem> = {
  // ── Spring ──
  asparagus: { name: { en: 'Asparagus', fr: 'Asperge' }, emoji: '🌿', type: 'vegetable', seasons: ['spring'] },
  peas: { name: { en: 'Peas', fr: 'Petits pois' }, emoji: '🟢', type: 'vegetable', seasons: ['spring', 'summer'] },
  radish: { name: { en: 'Radish', fr: 'Radis' }, emoji: '🔴', type: 'vegetable', seasons: ['spring'] },
  artichoke: { name: { en: 'Artichoke', fr: 'Artichaut' }, emoji: '🌻', type: 'vegetable', seasons: ['spring'] },
  spinach: { name: { en: 'Spinach', fr: 'Epinard' }, emoji: '🥬', type: 'vegetable', seasons: ['spring', 'autumn'] },
  rhubarb: { name: { en: 'Rhubarb', fr: 'Rhubarbe' }, emoji: '🌱', type: 'vegetable', seasons: ['spring'] },
  strawberry: { name: { en: 'Strawberry', fr: 'Fraise' }, emoji: '🍓', type: 'fruit', seasons: ['spring', 'summer'] },
  chervil: { name: { en: 'Chervil', fr: 'Cerfeuil' }, emoji: '🌿', type: 'herb', seasons: ['spring'] },
  sorrel: { name: { en: 'Sorrel', fr: 'Oseille' }, emoji: '🍃', type: 'herb', seasons: ['spring'] },
  watercress: { name: { en: 'Watercress', fr: 'Cresson' }, emoji: '🥗', type: 'vegetable', seasons: ['spring'] },
  newPotato: { name: { en: 'New Potato', fr: 'Pomme de terre nouvelle' }, emoji: '🥔', type: 'vegetable', seasons: ['spring'] },
  springOnion: { name: { en: 'Spring Onion', fr: 'Oignon nouveau' }, emoji: '🧅', type: 'vegetable', seasons: ['spring'] },
  favaBean: { name: { en: 'Fava Bean', fr: 'Feve' }, emoji: '🫘', type: 'legume', seasons: ['spring'] },

  // ── Summer ──
  tomato: { name: { en: 'Tomato', fr: 'Tomate' }, emoji: '🍅', type: 'vegetable', seasons: ['summer'] },
  zucchini: { name: { en: 'Zucchini', fr: 'Courgette' }, emoji: '🥒', type: 'vegetable', seasons: ['summer'] },
  eggplant: { name: { en: 'Eggplant', fr: 'Aubergine' }, emoji: '🍆', type: 'vegetable', seasons: ['summer'] },
  bellPepper: { name: { en: 'Bell Pepper', fr: 'Poivron' }, emoji: '🫑', type: 'vegetable', seasons: ['summer'] },
  cucumber: { name: { en: 'Cucumber', fr: 'Concombre' }, emoji: '🥒', type: 'vegetable', seasons: ['summer'] },
  corn: { name: { en: 'Corn', fr: 'Mais' }, emoji: '🌽', type: 'vegetable', seasons: ['summer'] },
  greenBean: { name: { en: 'Green Bean', fr: 'Haricot vert' }, emoji: '🫛', type: 'vegetable', seasons: ['summer'] },
  peach: { name: { en: 'Peach', fr: 'Peche' }, emoji: '🍑', type: 'fruit', seasons: ['summer'] },
  apricot: { name: { en: 'Apricot', fr: 'Abricot' }, emoji: '🍊', type: 'fruit', seasons: ['summer'] },
  melon: { name: { en: 'Melon', fr: 'Melon' }, emoji: '🍈', type: 'fruit', seasons: ['summer'] },
  watermelon: { name: { en: 'Watermelon', fr: 'Pasteque' }, emoji: '🍉', type: 'fruit', seasons: ['summer'] },
  cherry: { name: { en: 'Cherry', fr: 'Cerise' }, emoji: '🍒', type: 'fruit', seasons: ['summer'] },
  raspberry: { name: { en: 'Raspberry', fr: 'Framboise' }, emoji: '🫐', type: 'fruit', seasons: ['summer'] },
  blueberry: { name: { en: 'Blueberry', fr: 'Myrtille' }, emoji: '🫐', type: 'fruit', seasons: ['summer'] },
  fig: { name: { en: 'Fig', fr: 'Figue' }, emoji: '🟤', type: 'fruit', seasons: ['summer', 'autumn'] },
  basil: { name: { en: 'Basil', fr: 'Basilic' }, emoji: '🌿', type: 'herb', seasons: ['summer'] },
  mint: { name: { en: 'Mint', fr: 'Menthe' }, emoji: '🌿', type: 'herb', seasons: ['summer'] },
  fennel: { name: { en: 'Fennel', fr: 'Fenouil' }, emoji: '🌱', type: 'vegetable', seasons: ['summer', 'autumn'] },
  nectarine: { name: { en: 'Nectarine', fr: 'Nectarine' }, emoji: '🍑', type: 'fruit', seasons: ['summer'] },
  plum: { name: { en: 'Plum', fr: 'Prune' }, emoji: '🟣', type: 'fruit', seasons: ['summer'] },

  // ── Autumn ──
  pumpkin: { name: { en: 'Pumpkin', fr: 'Citrouille' }, emoji: '🎃', type: 'vegetable', seasons: ['autumn'] },
  butternutSquash: { name: { en: 'Butternut Squash', fr: 'Courge butternut' }, emoji: '🟠', type: 'vegetable', seasons: ['autumn', 'winter'] },
  mushroom: { name: { en: 'Mushroom', fr: 'Champignon' }, emoji: '🍄', type: 'vegetable', seasons: ['autumn'] },
  sweetPotato: { name: { en: 'Sweet Potato', fr: 'Patate douce' }, emoji: '🍠', type: 'vegetable', seasons: ['autumn', 'winter'] },
  apple: { name: { en: 'Apple', fr: 'Pomme' }, emoji: '🍎', type: 'fruit', seasons: ['autumn'] },
  pear: { name: { en: 'Pear', fr: 'Poire' }, emoji: '🍐', type: 'fruit', seasons: ['autumn'] },
  grape: { name: { en: 'Grape', fr: 'Raisin' }, emoji: '🍇', type: 'fruit', seasons: ['autumn'] },
  quince: { name: { en: 'Quince', fr: 'Coing' }, emoji: '🍈', type: 'fruit', seasons: ['autumn'] },
  chestnut: { name: { en: 'Chestnut', fr: 'Chataigne' }, emoji: '🌰', type: 'fruit', seasons: ['autumn'] },
  walnut: { name: { en: 'Walnut', fr: 'Noix' }, emoji: '🥜', type: 'fruit', seasons: ['autumn'] },
  broccoli: { name: { en: 'Broccoli', fr: 'Brocoli' }, emoji: '🥦', type: 'vegetable', seasons: ['autumn'] },
  cauliflower: { name: { en: 'Cauliflower', fr: 'Chou-fleur' }, emoji: '🥦', type: 'vegetable', seasons: ['autumn', 'winter'] },
  celery: { name: { en: 'Celery', fr: 'Celeri' }, emoji: '🌱', type: 'vegetable', seasons: ['autumn'] },
  celeriac: { name: { en: 'Celeriac', fr: 'Celeri-rave' }, emoji: '🌱', type: 'vegetable', seasons: ['autumn', 'winter'] },
  turnip: { name: { en: 'Turnip', fr: 'Navet' }, emoji: '🟡', type: 'vegetable', seasons: ['autumn', 'winter'] },
  beet: { name: { en: 'Beet', fr: 'Betterave' }, emoji: '🔴', type: 'vegetable', seasons: ['autumn'] },
  cranberry: { name: { en: 'Cranberry', fr: 'Canneberge' }, emoji: '🔴', type: 'fruit', seasons: ['autumn'] },
  persimmon: { name: { en: 'Persimmon', fr: 'Kaki' }, emoji: '🟠', type: 'fruit', seasons: ['autumn'] },
  pomegranate: { name: { en: 'Pomegranate', fr: 'Grenade' }, emoji: '🔴', type: 'fruit', seasons: ['autumn'] },
  sage: { name: { en: 'Sage', fr: 'Sauge' }, emoji: '🌿', type: 'herb', seasons: ['autumn'] },

  // ── Winter ──
  leek: { name: { en: 'Leek', fr: 'Poireau' }, emoji: '🥬', type: 'vegetable', seasons: ['winter'] },
  cabbage: { name: { en: 'Cabbage', fr: 'Chou' }, emoji: '🥬', type: 'vegetable', seasons: ['winter'] },
  kale: { name: { en: 'Kale', fr: 'Chou frise' }, emoji: '🥬', type: 'vegetable', seasons: ['winter'] },
  brusselsSprout: { name: { en: 'Brussels Sprout', fr: 'Chou de Bruxelles' }, emoji: '🟢', type: 'vegetable', seasons: ['winter'] },
  parsnip: { name: { en: 'Parsnip', fr: 'Panais' }, emoji: '🥕', type: 'vegetable', seasons: ['winter'] },
  rutabaga: { name: { en: 'Rutabaga', fr: 'Rutabaga' }, emoji: '🟡', type: 'vegetable', seasons: ['winter'] },
  endive: { name: { en: 'Endive', fr: 'Endive' }, emoji: '🥬', type: 'vegetable', seasons: ['winter'] },
  orange: { name: { en: 'Orange', fr: 'Orange' }, emoji: '🍊', type: 'fruit', seasons: ['winter'] },
  clementine: { name: { en: 'Clementine', fr: 'Clementine' }, emoji: '🍊', type: 'fruit', seasons: ['winter'] },
  grapefruit: { name: { en: 'Grapefruit', fr: 'Pamplemousse' }, emoji: '🍊', type: 'fruit', seasons: ['winter'] },
  lemon: { name: { en: 'Lemon', fr: 'Citron' }, emoji: '🍋', type: 'fruit', seasons: ['winter'] },
  kiwi: { name: { en: 'Kiwi', fr: 'Kiwi' }, emoji: '🥝', type: 'fruit', seasons: ['winter'] },
  salsify: { name: { en: 'Salsify', fr: 'Salsifis' }, emoji: '🌱', type: 'vegetable', seasons: ['winter'] },
  topinambour: { name: { en: 'Jerusalem Artichoke', fr: 'Topinambour' }, emoji: '🌱', type: 'vegetable', seasons: ['winter'] },
  rosemary: { name: { en: 'Rosemary', fr: 'Romarin' }, emoji: '🌿', type: 'herb', seasons: ['winter'] },
  thyme: { name: { en: 'Thyme', fr: 'Thym' }, emoji: '🌿', type: 'herb', seasons: ['winter'] },

  // ── Year-round ──
  onion: { name: { en: 'Onion', fr: 'Oignon' }, emoji: '🧅', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  garlic: { name: { en: 'Garlic', fr: 'Ail' }, emoji: '🧄', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  carrot: { name: { en: 'Carrot', fr: 'Carotte' }, emoji: '🥕', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  potato: { name: { en: 'Potato', fr: 'Pomme de terre' }, emoji: '🥔', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  shallot: { name: { en: 'Shallot', fr: 'Echalote' }, emoji: '🧅', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  parsley: { name: { en: 'Parsley', fr: 'Persil' }, emoji: '🌿', type: 'herb', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  cilantro: { name: { en: 'Cilantro', fr: 'Coriandre' }, emoji: '🌿', type: 'herb', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  chive: { name: { en: 'Chive', fr: 'Ciboulette' }, emoji: '🌿', type: 'herb', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  lettuce: { name: { en: 'Lettuce', fr: 'Laitue' }, emoji: '🥬', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  lentil: { name: { en: 'Lentil', fr: 'Lentille' }, emoji: '🟤', type: 'legume', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  chickpea: { name: { en: 'Chickpea', fr: 'Pois chiche' }, emoji: '🟡', type: 'legume', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  rice: { name: { en: 'Rice', fr: 'Riz' }, emoji: '🍚', type: 'grain', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  quinoa: { name: { en: 'Quinoa', fr: 'Quinoa' }, emoji: '🌾', type: 'grain', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  banana: { name: { en: 'Banana', fr: 'Banane' }, emoji: '🍌', type: 'fruit', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  avocado: { name: { en: 'Avocado', fr: 'Avocat' }, emoji: '🥑', type: 'fruit', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  ginger: { name: { en: 'Ginger', fr: 'Gingembre' }, emoji: '🫚', type: 'vegetable', seasons: ['spring', 'summer', 'autumn', 'winter'] },
};

// ─── Seed Functions ──────────────────────────────────────────────────────────

async function seedCuisines() {
  const batch = db.batch();
  for (const [id, data] of Object.entries(cuisines)) {
    batch.set(db.collection('cuisines').doc(id), data);
  }
  await batch.commit();
  console.log(`Seeded ${Object.keys(cuisines).length} cuisines`);
}

async function seedProduce() {
  // Firestore batch limit is 500, we're well under
  const batch = db.batch();
  for (const [id, data] of Object.entries(produce)) {
    batch.set(db.collection('produce').doc(id), data);
  }
  await batch.commit();
  console.log(`Seeded ${Object.keys(produce).length} produce items`);
}

async function main() {
  try {
    console.log('Starting seed...');
    await seedCuisines();
    await seedProduce();
    console.log('Seed complete!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();

# Saison — Implementation Brief

## Tech Stack

### Web
- **Framework**: Next.js 15 App Router with Turbopack
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (CSS-based config)
- **Backend**: Firebase (Auth + Firestore)
- **Testing**: Vitest + React Testing Library
- **Deployment**: Firebase Hosting (static export)

### iOS
- **Framework**: SwiftUI (iOS 17+)
- **Auth**: FirebaseAuth with Google Sign-In
- **Database**: FirebaseFirestore
- **State**: @ObservableObject / @Observable pattern
- **Package Manager**: Swift Package Manager

### Firebase Project
- **Project ID**: `weekeat-d5bc7`
- **Console**: https://console.firebase.google.com/project/weekeat-d5bc7

---

## Firestore Data Model

### Top-Level Collections

#### `users`
```typescript
interface User {
  uid: string;              // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL: string | null;
  familyId: string | null;  // Reference to family doc
  locale: 'en' | 'fr';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `families`
```typescript
interface Family {
  id: string;
  name: string;
  members: string[];        // Array of user UIDs
  adminUid: string;         // Family creator
  inviteCode: string;       // 6-char alphanumeric
  createdAt: Timestamp;
}
```

#### `invites`
```typescript
interface Invite {
  code: string;             // Document ID = invite code
  familyId: string;
  createdBy: string;        // UID
  createdAt: Timestamp;
  expiresAt: Timestamp;
}
```

#### `recipes`
```typescript
interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  cuisineId: string;
  season: Season | 'all';
  photoURL: string | null;
  authorUid: string;
  authorName: string;
  familyId: string;
  starCount: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  isPlant: boolean;         // For diversity tracking
}
```

#### `produce`
```typescript
interface Produce {
  id: string;
  nameEn: string;
  nameFr: string;
  category: 'fruit' | 'vegetable' | 'herb';
  seasons: Season[];
  emoji: string;
}
```

#### `cuisines`
```typescript
interface Cuisine {
  id: string;
  nameEn: string;
  nameFr: string;
  flag: string;             // Emoji flag
}
```

### Subcollections

#### `families/{familyId}/calendar`
```typescript
interface CalendarEntry {
  id: string;               // Format: "2024-W03-mon-dinner"
  weekId: string;           // ISO week: "2024-W03"
  day: DayOfWeek;           // 'mon' | 'tue' | ... | 'sun'
  mealType: MealType;       // 'breakfast' | 'lunch' | 'dinner'
  recipeId: string | null;  // Reference to recipe, or null for free-text
  title: string;            // Recipe title or free-text name
  addedBy: string;          // UID
  updatedAt: Timestamp;
}
```

#### `families/{familyId}/grocery`
```typescript
interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  addedBy: string;          // UID
  source: 'manual' | 'recipe';
  recipeId: string | null;
  createdAt: Timestamp;
}
```

#### `families/{familyId}/diversity`
```typescript
interface WeeklyDiversity {
  id: string;               // ISO week: "2024-W03"
  weekLabel: string;        // "Jan 15–21"
  plants: string[];         // Unique plant names
  count: number;
  goal: number;             // Default 30
  updatedAt: Timestamp;
}
```

#### `families/{familyId}/activity`
```typescript
interface ActivityItem {
  id: string;
  type: 'recipe_added' | 'meal_planned' | 'grocery_checked' | 'member_joined';
  actorUid: string;
  actorName: string;
  description: string;
  metadata: Record<string, string>;
  createdAt: Timestamp;
}
```

#### `recipes/{recipeId}/ratings`
```typescript
interface Rating {
  id: string;               // Document ID = user UID
  uid: string;
  stars: number;            // 1-5
  createdAt: Timestamp;
}
```

---

## Auth Flow

1. User taps "Sign in with Google"
2. Firebase Auth handles OAuth flow
3. On success, check if `users/{uid}` doc exists
   - If not, create user doc with defaults
4. Check if `user.familyId` is set
   - If not → redirect to Family Onboarding (create or join)
   - If yes → redirect to Home

---

## Web File Structure

```
new-eat-app/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home / landing
│   ├── recipes/
│   │   └── page.tsx            # Recipe browse + create
│   ├── calendar/
│   │   └── page.tsx            # Weekly meal calendar
│   ├── seasonal/
│   │   └── page.tsx            # Seasonal produce guide
│   ├── grocery/
│   │   └── page.tsx            # Grocery list
│   ├── settings/
│   │   └── page.tsx            # User & family settings
│   └── globals.css             # Tailwind v4 theme + design tokens
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx       # Mobile tab bar
│   │   ├── PageShell.tsx       # Page wrapper with header
│   │   └── AuthGuard.tsx       # Route protection
│   ├── screens/                # Full-page screen components
│   └── ui/                     # Reusable UI primitives
├── lib/
│   ├── firebase.ts             # Firebase app init
│   ├── auth.ts                 # Auth helpers
│   ├── i18n/
│   │   ├── en.ts               # English strings
│   │   └── fr.ts               # French strings
│   └── utils.ts                # Shared utilities
├── services/
│   ├── users.ts                # User CRUD
│   ├── families.ts             # Family CRUD + invites
│   ├── recipes.ts              # Recipe CRUD + ratings
│   ├── calendar.ts             # Calendar CRUD
│   ├── grocery.ts              # Grocery list CRUD
│   └── diversity.ts            # Diversity tracking
├── types/
│   └── index.ts                # All TypeScript interfaces
├── scripts/
│   └── seed.ts                 # Firestore seed data script
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── vitest.config.ts
├── vitest.setup.ts
├── firebase.json
├── .firebaserc
├── firestore.rules
├── firestore.indexes.json
├── .env.local
└── .gitignore
```

## iOS File Structure

```
Saison/
├── SaisonApp.swift
├── Models/
│   ├── User.swift
│   ├── Family.swift
│   ├── Recipe.swift
│   ├── CalendarEntry.swift
│   ├── GroceryItem.swift
│   └── Produce.swift
├── Services/
│   ├── AuthService.swift
│   ├── FamilyService.swift
│   ├── RecipeService.swift
│   ├── CalendarService.swift
│   └── GroceryService.swift
├── Views/
│   ├── Auth/
│   │   └── SignInView.swift
│   ├── Home/
│   │   └── HomeView.swift
│   ├── Recipes/
│   │   ├── RecipeListView.swift
│   │   └── RecipeDetailView.swift
│   ├── Calendar/
│   │   └── CalendarView.swift
│   ├── Grocery/
│   │   └── GroceryListView.swift
│   └── Settings/
│       └── SettingsView.swift
├── Components/
│   ├── MealSlotView.swift
│   ├── DiversityRingView.swift
│   └── ProduceChipView.swift
└── Resources/
    └── Assets.xcassets
```

---

## Design Tokens

### Colors
| Token             | Hex       | Usage                    |
|-------------------|-----------|--------------------------|
| `parchment`       | `#F5EFE0` | Background               |
| `forest`          | `#2D5A3D` | Primary / accents        |
| `forest-light`    | `#3A7A52` | Hover states             |
| `terracotta`      | `#C4704B` | Secondary accent         |
| `ink`             | `#2C2C2C` | Body text                |
| `ink-light`       | `#6B6B6B` | Secondary text           |
| `cream`           | `#FAF7F0` | Card backgrounds         |
| `border`          | `#E0D9CC` | Borders and dividers     |

### Fonts
| Token      | Family     | Usage              |
|------------|------------|--------------------|
| `display`  | Fraunces   | Headings, titles   |
| `body`     | System     | Body text, UI      |

### Spacing
Base unit: 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

### Radius
- `sm`: 6px
- `md`: 12px
- `lg`: 16px
- `full`: 9999px

---

## Testing Strategy

### Web
- **Unit tests**: Vitest for service functions and utilities
- **Component tests**: React Testing Library for UI components
- **Coverage target**: 80% for services, 60% for components

### iOS
- **Unit tests**: XCTest for services and models
- **UI tests**: XCUITest for critical flows

---

## Deployment

### Web
1. `npm run build` (static export to `out/`)
2. `firebase deploy --only hosting`

### iOS
- TestFlight for beta distribution
- App Store submission when stable

---

## Environment Variables

All Firebase config is stored in `.env.local` (not committed):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

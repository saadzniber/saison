# WeekEat Architecture

## Project Structure

```
new-eat-app/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (providers, fonts)
│   ├── page.tsx            # Landing / auth gate
│   ├── (auth)/             # Auth routes (login, signup, onboarding)
│   ├── (main)/             # Authenticated routes
│   │   ├── home/           # Weekly calendar view
│   │   ├── compass/        # Recipe discovery
│   │   ├── vote/           # Family meal voting
│   │   ├── garden/         # Diversity tracker
│   │   ├── seasons/        # Seasonal produce browser
│   │   └── list/           # Grocery list
│   └── api/                # API routes (if needed)
├── components/
│   ├── layout/             # BottomNav, PageShell, Header
│   ├── ui/                 # Reusable UI primitives
│   └── screens/            # Screen-level compositions
├── lib/                    # Pure utilities
│   ├── firebase.ts         # Firebase client init
│   ├── seasons.ts          # Season helpers
│   └── diversity.ts        # Diversity scoring
├── services/               # Firebase data access layer
│   ├── auth.ts             # Authentication operations
│   ├── recipes.ts          # Recipe CRUD
│   ├── families.ts         # Family management
│   ├── calendar.ts         # Calendar entries
│   ├── grocery.ts          # Grocery list
│   └── produce.ts          # Produce queries
├── types/                  # Shared TypeScript types
├── ios/                    # iOS (Swift) companion app
│   └── WeekEat/
├── scripts/
│   └── seed.ts             # Firestore seed script
├── firestore.rules         # Security rules
├── firestore.indexes.json  # Composite indexes
└── firebase.json           # Firebase project config
```

## Firestore Data Model

### Top-Level Collections

#### `/users/{uid}`
```typescript
{
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  familyIds: string[];          // families this user belongs to
  activeFamilyId: string;       // currently selected family
  preferences: {
    locale: 'en' | 'fr';
    dietaryRestrictions: string[];
    dislikedIngredients: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `/families/{familyId}`
```typescript
{
  name: string;
  memberIds: string[];           // UIDs of all members
  createdBy: string;             // UID of creator
  inviteCode: string;            // active invite code
  settings: {
    weekStartDay: 0 | 1;        // 0=Sunday, 1=Monday
    defaultServings: number;
    diversityGoal: number;       // weekly unique ingredient target
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `/families/{familyId}/calendar/{entryId}`
```typescript
{
  date: string;                  // 'YYYY-MM-DD'
  slot: 'lunch' | 'dinner';
  recipeId?: string;
  customMealName?: string;       // for quick entries without a recipe
  assignedTo?: string;           // UID of cook
  servings: number;
  notes?: string;
  ingredients: string[];         // produce IDs used (for diversity)
  createdBy: string;
  createdAt: Timestamp;
}
```

#### `/families/{familyId}/grocery/{itemId}`
```typescript
{
  name: string;
  quantity?: number;
  unit?: string;
  category: string;              // produce type or 'other'
  checked: boolean;
  addedBy: string;               // UID
  sourceRecipeId?: string;       // recipe that generated this item
  createdAt: Timestamp;
}
```

#### `/families/{familyId}/diversity/{weekId}`
```typescript
{
  weekLabel: string;             // 'YYYY-Www'
  uniqueIngredients: string[];   // produce IDs
  cuisineCount: number;
  score: number;                 // 0-100 composite score
  updatedAt: Timestamp;
}
```

#### `/families/{familyId}/activity/{activityId}`
```typescript
{
  type: 'meal_planned' | 'meal_cooked' | 'recipe_saved' | 'member_joined' | 'vote_cast';
  actorId: string;               // UID
  actorName: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
}
```

#### `/recipes/{id}`
```typescript
{
  title: { en: string; fr: string };
  description: { en: string; fr: string };
  cuisine: string;               // cuisine doc ID
  seasons: string[];             // 'spring' | 'summer' | 'autumn' | 'winter'
  ingredients: {
    produceId?: string;          // link to /produce doc
    name: { en: string; fr: string };
    quantity: number;
    unit: string;
  }[];
  steps: { en: string; fr: string }[];
  prepTime: number;              // minutes
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageURL?: string;
  isPublic: boolean;
  createdBy: string;             // UID
  savedBy: string[];             // UIDs who bookmarked it
  communityScore: number;        // average rating
  ratingCount: number;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `/recipes/{id}/ratings/{userId}`
```typescript
{
  score: number;                 // 1-5
  comment?: string;
  createdAt: Timestamp;
}
```

#### `/invites/{code}`
```typescript
{
  familyId: string;
  createdBy: string;
  usedBy?: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}
```

#### `/produce/{id}` (reference data)
```typescript
{
  name: { en: string; fr: string };
  emoji: string;
  type: 'vegetable' | 'fruit' | 'herb' | 'legume' | 'grain';
  seasons: ('spring' | 'summer' | 'autumn' | 'winter')[];
}
```

#### `/cuisines/{id}` (reference data)
```typescript
{
  name: { en: string; fr: string };
  emoji: string;
}
```

## Authentication Flow

1. **Sign Up**: Email/password or Google OAuth via Firebase Auth
2. **Onboarding**: Create or join a family
   - Create: generates a new `/families` doc, sets user as first member
   - Join: enter invite code, resolves to family, adds user to `memberIds`
3. **Session**: Firebase Auth persists session via IndexedDB (web) or Keychain (iOS)
4. **Auth State**: `onAuthStateChanged` listener in root layout provider
5. **Route Guard**: Middleware or layout-level redirect if no auth token

## Data Flow Patterns

### Read Pattern (Real-time)
```
Component → useFirestoreQuery(collection, query) → onSnapshot → React state → render
```

### Write Pattern
```
Component → service function → Firestore SDK write → onSnapshot triggers re-render
```

### Calendar Week View
1. Query `/families/{id}/calendar` where `date >= weekStart` and `date <= weekEnd`
2. Group by date and slot
3. Resolve `recipeId` references for display

### Diversity Scoring
1. On each calendar entry write, extract `ingredients` array
2. Cloud Function or client-side: aggregate unique ingredients for the week
3. Write weekly summary to `/families/{id}/diversity/{weekId}`

### Grocery List Generation
1. User selects meals for the week
2. Aggregate all recipe ingredients
3. Deduplicate and merge quantities
4. Write to `/families/{id}/grocery` subcollection

## Security Model

### Firestore Rules Principles
- **Authenticated access**: All writes require `request.auth != null`
- **Family isolation**: Family subcollections gated by `memberIds` check
- **Owner-only user docs**: Users can only write their own profile
- **Recipe visibility**: Public recipes readable by all; private only by creator or savers
- **Reference data**: `/produce` and `/cuisines` are publicly readable, admin-only write
- **Rate limiting**: Handled at Firebase App Check level

### Data Validation
- Rules enforce field types and required fields on create/update
- Client-side validation provides UX feedback before write attempt
- Cloud Functions perform complex validation where rules are insufficient

## Deployment Process

### Web (Next.js)
1. Build: `next build` produces static + server output
2. Deploy to Vercel (recommended) or Firebase Hosting
3. Environment variables set in Vercel dashboard or `.env.production`

### Firebase
1. `firebase deploy --only firestore:rules` — deploy security rules
2. `firebase deploy --only firestore:indexes` — deploy composite indexes
3. `npx tsx scripts/seed.ts` — seed reference data (one-time)

### iOS
1. Xcode project in `/ios/WeekEat/`
2. Uses Firebase iOS SDK via Swift Package Manager
3. Deploy via TestFlight / App Store Connect

### CI/CD
- GitHub Actions workflow:
  - On PR: lint, type-check, test
  - On merge to main: deploy to staging
  - On release tag: deploy to production

## Testing Strategy

### Unit Tests
- **Framework**: Vitest
- **Scope**: Pure functions in `lib/`, data transformations, scoring algorithms
- **Location**: Co-located `*.test.ts` files

### Integration Tests
- **Firebase Emulator**: Local Firestore + Auth emulators for service layer tests
- **Scope**: Service functions, security rules validation

### Component Tests
- **Framework**: Vitest + React Testing Library
- **Scope**: UI components with mocked Firebase context

### E2E Tests (future)
- **Framework**: Playwright
- **Scope**: Critical user flows (sign up, plan meal, generate grocery list)

### Security Rules Tests
- **Framework**: `@firebase/rules-unit-testing`
- **Scope**: All rule paths — test allowed and denied access patterns

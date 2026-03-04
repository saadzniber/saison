# Saison — Family Meal Compass

A warm, minimal app that helps families plan meals together using seasonal ingredients, track plant diversity, and share grocery lists.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase CLI (`npm i -g firebase-tools`)

### Installation

```bash
cd new-eat-app
npm install
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000) with Turbopack.

### Testing

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
```

### Deployment

```bash
npm run build         # Static export to out/
firebase deploy       # Deploy to Firebase Hosting
```

## Firebase Setup

1. The app uses Firebase project `weekeat-d5bc7`
2. Enable **Google Sign-In** in Firebase Console > Authentication > Sign-in method
3. Enable **Cloud Firestore** in Firebase Console > Firestore Database
4. Copy `.env.local` values from the team (not committed to git)

### Seeding Data

```bash
npm run seed
```

Populates Firestore with seasonal produce and cuisine reference data.

## iOS Setup

1. Open `Saison.xcodeproj` in Xcode 15+
2. Add `GoogleService-Info.plist` from Firebase Console
3. Add Firebase SDK via Swift Package Manager
4. Build and run on iOS 17+ simulator or device

## Tech Stack

- **Web**: Next.js 15, TypeScript, Tailwind v4, Firebase
- **iOS**: SwiftUI, Firebase
- **Testing**: Vitest, React Testing Library
- **Hosting**: Firebase Hosting (static export)

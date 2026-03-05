# Saison - Project Guidelines

## Architecture

- **Web**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **iOS**: SwiftUI, iOS 17+, Swift Package (Sources/Saison)
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **Localization**: English + French. Web uses `lib/i18n.tsx` (`useTranslation` / `t()`). iOS uses `LocalizationManager` singleton with `.lproj` bundles.

## Core Rules

### Feature & Visual Parity
Web and iOS must look and behave identically. When implementing or changing anything on one platform, always apply the same change to the other. This includes UI layout, behavior, data models, and Firestore field names.

### Localization
All user-facing copy must be localized — no hardcoded strings. Ever.
- **Web**: Add keys to both `en` and `fr` in `lib/i18n.tsx`, use `t('key')` in components.
- **iOS**: Add keys to both `en.lproj/Localizable.strings` and `fr.lproj/Localizable.strings`, use `loc.t("key")` in views or `LocalizationManager.shared.t("key")` in non-view code.

### Testing
- Write tests for every new feature.
- Ensure existing features have test coverage.
- Web tests: Vitest (`npx vitest run`), test files in `__tests__/`.
- Run tests before committing.

### Git Workflow
- Always commit and push after completing work.
- Write clear, concise commit messages.

### Deployment
- After changing the web app, always run: `firebase deploy --only hosting`
- Firestore rules/indexes: `firebase deploy --only firestore`

## Key Files

- `lib/i18n.tsx` — Web translations (en/fr) and `useTranslation` hook
- `ios/Sources/Saison/LocalizationManager.swift` — iOS in-app language switching
- `ios/Sources/Saison/Models/Models.swift` — Shared data models (iOS)
- `types/index.ts` — Shared types and helpers (web)
- `services/` — Firestore service layer (web)
- `ios/Sources/Saison/ViewModels/AppViewModel.swift` — iOS Firestore service layer
- `firestore.rules` — Security rules (use field existence guards)

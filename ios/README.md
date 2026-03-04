# Saison iOS App

## Xcode Setup

1. **Open in Xcode**: Open the `ios/` directory in Xcode (File > Open > select the `ios` folder).

2. **Add Firebase packages via SPM**:
   - File > Add Package Dependencies
   - Enter: `https://github.com/firebase/firebase-ios-sdk`
   - Select version: 11.0.0 (or latest)
   - Add these products to the Saison target:
     - `FirebaseAuth`
     - `FirebaseFirestore`

3. **Add Google Sign-In via SPM**:
   - File > Add Package Dependencies
   - Enter: `https://github.com/google/GoogleSignIn-iOS`
   - Select version: 8.0.0 (or latest)
   - Add these products:
     - `GoogleSignIn`
     - `GoogleSignInSwift`

4. **Configure the target**:
   - Select the Saison target > General
   - Set Bundle Identifier: `com.saadzniber.saison`
   - Set minimum deployment target: iOS 16.0
   - Select your development team

5. **Add URL Scheme**:
   - Target > Info > URL Types
   - Add a URL scheme with the REVERSED_CLIENT_ID value:
     `com.googleusercontent.apps.813519378689-8omfmqanfvtad2cupuohsvufl2n3laug`

6. **Move GoogleService-Info.plist**:
   - The plist is in `ios/GoogleService-Info.plist` but must also be accessible at `Sources/Saison/GoogleService-Info.plist` for SPM resource processing
   - Copy it into `Sources/Saison/` if not already there

7. **Add custom fonts** (optional):
   - Download Fraunces and DM Sans from Google Fonts
   - Add .ttf files to the project
   - Register in Info.plist under "Fonts provided by application"
   - The app falls back to system fonts if custom fonts are not available

8. **Build and run** on a simulator or device.

## Architecture

- **MVVM** with `@ObservableObject` ViewModels
- **AppViewModel**: Single source of truth for auth state, family data, recipes, calendar, grocery
- **Firebase**: Auth (Google Sign-In) + Firestore (all data)
- **Localization**: English and French via Localizable.strings

## File Structure

```
ios/
  Package.swift
  GoogleService-Info.plist
  Sources/Saison/
    SaisonApp.swift          # App entry point, Firebase config
    ContentView.swift        # Auth gate (loading/auth/onboarding/main)
    Theme.swift              # Design tokens (colors, fonts, spacing)
    Models/
      Models.swift           # All data models
    ViewModels/
      AppViewModel.swift     # All app state + Firestore operations
    Views/
      AuthView.swift         # Google Sign-In screen
      OnboardingView.swift   # Create/join family flow
      MainTabView.swift      # 5-tab navigation
      HomeView.swift         # Greeting, diversity ring, upcoming, activity
      RecipesView.swift      # Recipe list with search + tabs
      RecipeDetailView.swift # Full recipe view with rating, calendar, grocery
      CreateRecipeView.swift # Create/edit recipe form
      CalendarView.swift     # Weekly meal planning grid
      SeasonalView.swift     # Seasonal produce browser
      GroceryView.swift      # Grocery checklist
      SettingsView.swift     # Profile, family, language, account
    en.lproj/
      Localizable.strings    # English translations
    fr.lproj/
      Localizable.strings    # French translations
```

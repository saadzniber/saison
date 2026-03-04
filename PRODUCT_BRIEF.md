# Saison — Family Meal Compass

## Product Brief

### Vision

Saison helps families eat better with less decision fatigue. By surfacing seasonal, diverse ingredients and simplifying weekly meal planning, Saison turns the daily "what's for dinner?" question into a calm, guided experience. The app encourages families to explore a wider variety of plants, cuisines, and flavors — together.

### Target Users

- **Families with children** who want to plan meals collaboratively and reduce food waste
- **Health-conscious adults** looking for seasonal eating guidance and dietary diversity tracking
- **Home cooks** who want a shared recipe collection and grocery workflow

### Core Features

#### 1. Authentication
- Google Sign-In (web and iOS)
- Account creation with display name and avatar
- Persistent session across devices

#### 2. Family Management
- Create a family group with a name
- Generate a shareable invite code (6-character alphanumeric)
- Join an existing family via invite code
- Each user belongs to one family at a time
- Family members list with roles (admin / member)

#### 3. Recipe Management
- Create recipes with title, description, ingredients (with quantities), steps, prep/cook time, servings, cuisine tag, season tag, and photo
- Browse community recipes shared by all families
- Star/save recipes to personal favorites
- 5-star rating system with average displayed
- Edit and delete own recipes
- Ingredient list feeds into grocery list generation

#### 4. Weekly Meal Calendar
- Plan meals for the current week (Monday–Sunday)
- Three meal slots per day: Breakfast, Lunch, Dinner
- Rows = days (Mon–Sun), Columns = meal types (Breakfast, Lunch, Dinner)
- Assign recipes or free-text meal names to slots
- Any family member can edit the shared calendar
- Navigate between weeks

#### 5. Seasonal Produce Guide
- Curated list of fruits and vegetables organized by season (Spring, Summer, Autumn, Winter)
- Bilingual names: English and French
- Visual indicators for what's currently in season
- Tap to see which recipes use a given produce item

#### 6. Grocery List
- Auto-populated from recipes added to the weekly calendar
- Manual item addition
- Check off items while shopping
- Automatic deduplication and quantity aggregation
- Shared across the family in real-time

#### 7. Diversity Tracking (30 Plants/Week Challenge)
- Track unique plant-based ingredients consumed each week
- Visual ring/progress indicator toward the 30-plant goal
- Historical weekly breakdown
- Counts automatically from calendar recipes' ingredient lists

#### 8. Activity Feed
- Family-scoped feed showing recent actions
- Examples: "Alice added Ratatouille to Wednesday dinner", "Bob checked off 3 grocery items"
- Timestamps and member avatars
- Lightweight social layer to keep everyone in sync

### Localization

- **English** (default) and **French** fully supported
- All UI strings, produce names, and system messages translated
- Locale detection with manual override in settings

### Platforms

- **Web**: Next.js Progressive Web App (PWA) — installable, offline-capable
- **iOS**: Native SwiftUI app sharing the same Firebase backend

### Design Philosophy

- **Minimalist**: Clean layouts, generous whitespace, no visual clutter
- **Warm**: Parchment backgrounds (#F5EFE0), forest green accents (#2D5A3D), terracotta highlights (#C4704B)
- **Functional**: Every element serves a purpose; no decorative noise
- **Typography**: Fraunces for display headings, system fonts for body text
- **Tactile**: Subtle shadows, rounded corners, and gentle transitions convey a handcrafted feel

### Success Metrics

- Families planning 5+ meals per week on the calendar
- Users logging 20+ unique plants per week on average
- Recipe collection growing organically through community contributions
- Grocery list completion rate (items checked off vs. added)

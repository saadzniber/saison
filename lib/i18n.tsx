'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Locale = 'en' | 'fr';

interface I18nContextValue {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  t: (key: string) => key,
  locale: 'en',
  setLocale: () => {},
});

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_recipes: 'Recipes',
    nav_calendar: 'Calendar',
    nav_seasonal: 'Seasonal',
    nav_grocery: 'Grocery',
    nav_settings: 'Settings',

    // Sign in
    signin_title: 'Saison',
    signin_tagline: 'Eat with the seasons',
    signin_google: 'Continue with Google',
    signin_subtitle: 'Track diversity \u00b7 Plan with family \u00b7 Discover seasonal',

    // Onboarding
    onboarding_welcome: 'Welcome to Saison!',
    onboarding_create_family: 'Create a Family',
    onboarding_join_family: 'Join a Family',
    onboarding_family_name: 'Family Name',
    onboarding_invite_code: 'Invite Code',
    onboarding_create_btn: 'Create',
    onboarding_join_btn: 'Join',
    onboarding_or: 'or',

    // Home
    home_greeting: 'Good morning, {name}',
    home_plants_week: '{n} plants this week',
    home_plants_goal: 'Goal: 30',
    home_activity: 'Family Activity',
    home_no_activity: 'No activity yet',
    home_this_week: 'This Week',
    home_plants_challenge_title: 'The 30 Plants Challenge',
    home_plants_challenge_body: 'Research from the American Gut Project shows that people who eat 30 or more different plant types per week have significantly more diverse gut microbiomes, which is linked to better overall health. Track your plant diversity with Saison!',

    // Recipes
    recipe_my: 'My Recipes',
    recipe_starred: 'Starred',
    recipe_community: 'Community',
    recipe_search: 'Search recipes...',
    recipe_empty_my: 'No recipes yet. Create your first!',
    recipe_empty_starred: 'No starred recipes yet.',
    recipe_empty_community: 'No community recipes yet.',
    recipe_new: 'New Recipe',
    recipe_save: 'Save',
    recipe_saved: 'Saved',
    recipe_unsave: 'Unsave',
    recipe_edit: 'Edit',
    recipe_delete: 'Delete',
    recipe_add_calendar: 'Add to Calendar',
    recipe_add_grocery: 'Add to Grocery List',
    recipe_ingredients: 'Ingredients',
    recipe_produce: 'Produce',
    recipe_preptime: 'Prep Time',
    recipe_servings: 'Servings',
    recipe_plants: 'Plants',
    recipe_share_community: 'Share with Community',
    recipe_rate: 'Rate',
    recipe_rated: 'Rated',
    recipe_community_score: 'Community Score',
    recipe_your_rating: 'Your Rating',
    recipe_no_rating: 'No ratings yet',

    // Create recipe
    create_title: 'Create Recipe',
    create_name: 'Recipe Name',
    create_description: 'Description',
    create_cuisine: 'Cuisine',
    create_seasons: 'Seasons',
    create_preptime: 'Prep Time (min)',
    create_servings: 'Servings',
    create_ingredients: 'Ingredients',
    create_add_ingredient: 'Add Ingredient',
    create_produce: 'Produce',
    create_save: 'Save Recipe',
    create_saving: 'Saving...',
    create_error_name: 'Please enter a recipe name.',
    create_error_ingredients: 'Please add at least one ingredient.',
    create_error_save: 'Failed to save recipe. Please try again.',
    create_error_permission: 'You do not have permission to save recipes.',
    create_error_offline: 'You appear to be offline. Please check your connection.',

    // Calendar
    calendar_title: 'Meal Calendar',
    calendar_breakfast: 'Breakfast',
    calendar_lunch: 'Lunch',
    calendar_dinner: 'Dinner',
    calendar_add: 'Add Meal',
    calendar_empty: 'No meals planned',
    calendar_week_of: 'Week of',
    calendar_planned: '{n} meals planned',

    // Seasonal
    seasonal_title: 'Seasonal Produce',
    seasonal_spring: 'Spring',
    seasonal_summer: 'Summer',
    seasonal_autumn: 'Autumn',
    seasonal_winter: 'Winter',
    seasonal_empty: 'No produce for this season.',

    // Grocery
    grocery_title: 'Grocery List',
    grocery_empty: 'Your grocery list is empty.',
    grocery_browse: 'Browse Recipes',
    grocery_clear_checked: 'Clear Checked',
    grocery_confirm_clear: 'Remove all checked items?',

    // Settings
    settings_title: 'Settings',
    settings_profile: 'Profile',
    settings_family: 'Family',
    settings_language: 'Language',
    settings_en: 'English',
    settings_fr: 'French',
    settings_signout: 'Sign Out',
    settings_signout_confirm: 'Are you sure you want to sign out?',
    settings_delete_account: 'Delete Account',
    settings_delete_confirm: 'This will permanently delete your account and all data. This cannot be undone.',
    settings_members: 'Members',
    settings_invite: 'Invite',
    settings_invite_copy: 'Copy Invite Code',
    settings_leave_family: 'Leave Family',
    settings_leave_confirm: 'Are you sure you want to leave this family?',
    settings_notifications: 'Notifications',
    settings_version: 'Version',
    settings_about: 'About',

    // Meal types
    mealType_breakfast: 'Breakfast',
    mealType_lunch: 'Lunch',
    mealType_dinner: 'Dinner',

    // Seasons
    season_spring: 'Spring',
    season_summer: 'Summer',
    season_autumn: 'Autumn',
    season_winter: 'Winter',

    // Time
    time_just_now: 'Just now',
    time_minutes_ago: '{n}m ago',
    time_hours_ago: '{n}h ago',
    time_yesterday: 'Yesterday',
    time_days_ago: '{n} days ago',

    // Common
    error_generic: 'Something went wrong. Please try again.',
    error_network: 'Network error. Please check your connection.',
    error_permission: 'You do not have permission to perform this action.',
    error_not_found: 'Not found.',
    loading: 'Loading...',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    confirm: 'Confirm',
    back: 'Back',
    close: 'Close',
    done: 'Done',
    ok: 'OK',
  },
  fr: {
    // Navigation
    nav_home: 'Accueil',
    nav_recipes: 'Recettes',
    nav_calendar: 'Calendrier',
    nav_seasonal: 'De saison',
    nav_grocery: 'Courses',
    nav_settings: 'Réglages',

    // Sign in
    signin_title: 'Saison',
    signin_tagline: 'Mangez avec les saisons',
    signin_google: 'Continuer avec Google',
    signin_subtitle: 'Suivez la diversit\u00e9 \u00b7 Planifiez en famille \u00b7 D\u00e9couvrez le saisonnier',

    // Onboarding
    onboarding_welcome: 'Bienvenue sur Saison !',
    onboarding_create_family: 'Cr\u00e9er une famille',
    onboarding_join_family: 'Rejoindre une famille',
    onboarding_family_name: 'Nom de famille',
    onboarding_invite_code: "Code d'invitation",
    onboarding_create_btn: 'Cr\u00e9er',
    onboarding_join_btn: 'Rejoindre',
    onboarding_or: 'ou',

    // Home
    home_greeting: 'Bonjour, {name}',
    home_plants_week: '{n} plantes cette semaine',
    home_plants_goal: 'Objectif : 30',
    home_activity: 'Activit\u00e9 familiale',
    home_no_activity: "Pas encore d'activit\u00e9",
    home_this_week: 'Cette semaine',
    home_plants_challenge_title: 'Le d\u00e9fi des 30 plantes',
    home_plants_challenge_body: "Les recherches de l'American Gut Project montrent que les personnes qui consomment 30 types de plantes diff\u00e9rents ou plus par semaine ont un microbiome intestinal nettement plus diversifi\u00e9, ce qui est li\u00e9 \u00e0 une meilleure sant\u00e9 globale. Suivez votre diversit\u00e9 v\u00e9g\u00e9tale avec Saison !",

    // Recipes
    recipe_my: 'Mes recettes',
    recipe_starred: 'Favoris',
    recipe_community: 'Communaut\u00e9',
    recipe_search: 'Rechercher des recettes...',
    recipe_empty_my: "Aucune recette. Cr\u00e9ez votre premi\u00e8re !",
    recipe_empty_starred: 'Aucune recette favorite.',
    recipe_empty_community: 'Aucune recette communautaire.',
    recipe_new: 'Nouvelle recette',
    recipe_save: 'Enregistrer',
    recipe_saved: 'Enregistr\u00e9e',
    recipe_unsave: 'Retirer',
    recipe_edit: 'Modifier',
    recipe_delete: 'Supprimer',
    recipe_add_calendar: 'Ajouter au calendrier',
    recipe_add_grocery: 'Ajouter \u00e0 la liste de courses',
    recipe_ingredients: 'Ingr\u00e9dients',
    recipe_produce: 'Produits',
    recipe_preptime: 'Temps de pr\u00e9paration',
    recipe_servings: 'Portions',
    recipe_plants: 'Plantes',
    recipe_share_community: 'Partager avec la communaut\u00e9',
    recipe_rate: 'Noter',
    recipe_rated: 'Not\u00e9e',
    recipe_community_score: 'Note communautaire',
    recipe_your_rating: 'Votre note',
    recipe_no_rating: 'Aucune note',

    // Create recipe
    create_title: 'Cr\u00e9er une recette',
    create_name: 'Nom de la recette',
    create_description: 'Description',
    create_cuisine: 'Cuisine',
    create_seasons: 'Saisons',
    create_preptime: 'Temps de pr\u00e9p. (min)',
    create_servings: 'Portions',
    create_ingredients: 'Ingr\u00e9dients',
    create_add_ingredient: 'Ajouter un ingr\u00e9dient',
    create_produce: 'Produits',
    create_save: 'Enregistrer la recette',
    create_saving: 'Enregistrement...',
    create_error_name: 'Veuillez entrer un nom de recette.',
    create_error_ingredients: 'Veuillez ajouter au moins un ingr\u00e9dient.',
    create_error_save: "Impossible d'enregistrer la recette. Veuillez r\u00e9essayer.",
    create_error_permission: "Vous n'avez pas la permission d'enregistrer des recettes.",
    create_error_offline: 'Vous semblez \u00eatre hors ligne. V\u00e9rifiez votre connexion.',

    // Calendar
    calendar_title: 'Calendrier des repas',
    calendar_breakfast: 'Petit-d\u00e9jeuner',
    calendar_lunch: 'D\u00e9jeuner',
    calendar_dinner: 'D\u00eener',
    calendar_add: 'Ajouter un repas',
    calendar_empty: 'Aucun repas pr\u00e9vu',
    calendar_week_of: 'Semaine du',
    calendar_planned: '{n} repas pr\u00e9vus',

    // Seasonal
    seasonal_title: 'Produits de saison',
    seasonal_spring: 'Printemps',
    seasonal_summer: '\u00c9t\u00e9',
    seasonal_autumn: 'Automne',
    seasonal_winter: 'Hiver',
    seasonal_empty: 'Aucun produit pour cette saison.',

    // Grocery
    grocery_title: 'Liste de courses',
    grocery_empty: 'Votre liste de courses est vide.',
    grocery_browse: 'Parcourir les recettes',
    grocery_clear_checked: 'Effacer les coch\u00e9s',
    grocery_confirm_clear: 'Supprimer tous les articles coch\u00e9s ?',

    // Settings
    settings_title: 'Param\u00e8tres',
    settings_profile: 'Profil',
    settings_family: 'Famille',
    settings_language: 'Langue',
    settings_en: 'Anglais',
    settings_fr: 'Fran\u00e7ais',
    settings_signout: 'D\u00e9connexion',
    settings_signout_confirm: '\u00cates-vous s\u00fbr de vouloir vous d\u00e9connecter ?',
    settings_delete_account: 'Supprimer le compte',
    settings_delete_confirm: 'Cela supprimera d\u00e9finitivement votre compte et toutes vos donn\u00e9es. Cette action est irr\u00e9versible.',
    settings_members: 'Membres',
    settings_invite: 'Inviter',
    settings_invite_copy: "Copier le code d'invitation",
    settings_leave_family: 'Quitter la famille',
    settings_leave_confirm: '\u00cates-vous s\u00fbr de vouloir quitter cette famille ?',
    settings_notifications: 'Notifications',
    settings_version: 'Version',
    settings_about: '\u00c0 propos',

    // Meal types
    mealType_breakfast: 'Petit-d\u00e9jeuner',
    mealType_lunch: 'D\u00e9jeuner',
    mealType_dinner: 'D\u00eener',

    // Seasons
    season_spring: 'Printemps',
    season_summer: '\u00c9t\u00e9',
    season_autumn: 'Automne',
    season_winter: 'Hiver',

    // Time
    time_just_now: "\u00c0 l'instant",
    time_minutes_ago: 'Il y a {n} min',
    time_hours_ago: 'Il y a {n} h',
    time_yesterday: 'Hier',
    time_days_ago: 'Il y a {n} jours',

    // Common
    error_generic: 'Une erreur est survenue. Veuillez r\u00e9essayer.',
    error_network: 'Erreur r\u00e9seau. V\u00e9rifiez votre connexion.',
    error_permission: "Vous n'avez pas la permission d'effectuer cette action.",
    error_not_found: 'Introuvable.',
    loading: 'Chargement...',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    confirm: 'Confirmer',
    back: 'Retour',
    close: 'Fermer',
    done: 'Termin\u00e9',
    ok: 'OK',
  },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('saison-locale') as Locale | null;
    if (saved === 'en' || saved === 'fr') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('saison-locale', l);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let value = translations[locale][key] ?? translations.en[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return value;
  };

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoUrl: string;
  familyId?: string;
  starredRecipes: string[];
  createdAt?: Date;
}

export interface Family {
  id: string;
  name: string;
  memberIds: string[];
  adminId: string;
  inviteCode: string;
  createdAt?: Date;
}

export interface Invite {
  code: string;
  familyId: string;
  familyName: string;
  createdBy: string;
  createdAt?: Date;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  produce: string[];
  cuisine: string;
  seasons: Season[];
  prepTime: number;
  servings: number;
  plants: number;
  createdBy: string;
  createdByName: string;
  isPublic: boolean;
  savedBy: string[];
  communityScore?: number;
  ratingCount?: number;
  imageUrl?: string;
  createdAt?: Date;
}

export interface CalendarEntry {
  id: string;
  recipeId: string;
  recipeName: string;
  mealType: MealType;
  date: string; // 'YYYY-MM-DD'
  addedBy: string;
  addedByName: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
  checked: boolean;
  addedBy: string;
  addedByName: string;
  recipeId?: string;
  recipeName?: string;
}

export interface ProduceName {
  en: string;
  fr: string;
}

export interface Produce {
  id: string;
  name: string | ProduceName;
  emoji: string;
  type: 'vegetable' | 'fruit' | 'herb' | 'grain' | 'legume' | 'nut';
  seasons: Season[];
  description?: string;
}

export interface Cuisine {
  id: string;
  name: ProduceName;
  emoji: string;
}

export interface WeeklyDiversity {
  weekId: string;
  produce: Record<string, number>;
  score: number;
  updatedAt?: Date;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  type: 'recipe_created' | 'recipe_saved' | 'calendar_added' | 'grocery_added' | 'member_joined';
  payload: Record<string, string>;
  createdAt: Date;
}

export function getProduceName(produce: Produce, locale: string): string {
  if (typeof produce.name === 'string') return produce.name;
  return locale === 'fr' ? produce.name.fr : produce.name.en;
}

export function getWeekId(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getWeekDates(weekOffset = 0): Array<{ label: string; short: string; date: string; isToday: boolean }> {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);
  const todayStr = today.toISOString().split('T')[0];
  const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const date = d.toISOString().split('T')[0];
    return { label, short: shorts[i], date, isToday: date === todayStr };
  });
}

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];
export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

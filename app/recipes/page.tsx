'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import RecipesScreen from '@/components/screens/RecipesScreen';
import RecipeDetailScreen from '@/components/screens/RecipeDetailScreen';
import { PageLoader } from '@/components/layout/LoadingSpinner';

function RecipesContent() {
  const searchParams = useSearchParams();
  const recipeId = searchParams.get('id');

  if (recipeId) {
    return <RecipeDetailScreen recipeId={recipeId} />;
  }
  return <RecipesScreen />;
}

export default function RecipesPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<PageLoader />}>
        <RecipesContent />
      </Suspense>
    </AuthGuard>
  );
}

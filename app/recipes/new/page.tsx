'use client';
import { AuthGuard } from '@/components/layout/AuthGuard';
import CreateRecipeScreen from '@/components/screens/CreateRecipeScreen';

export default function NewRecipePage() {
  return (
    <AuthGuard>
      <CreateRecipeScreen />
    </AuthGuard>
  );
}

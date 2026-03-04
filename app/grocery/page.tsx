'use client';
import { AuthGuard } from '@/components/layout/AuthGuard';
import GroceryScreen from '@/components/screens/GroceryScreen';

export default function GroceryPage() {
  return (
    <AuthGuard>
      <GroceryScreen />
    </AuthGuard>
  );
}

'use client';
import { AuthGuard } from '@/components/layout/AuthGuard';
import SettingsScreen from '@/components/screens/SettingsScreen';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsScreen />
    </AuthGuard>
  );
}

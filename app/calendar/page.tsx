'use client';
import { AuthGuard } from '@/components/layout/AuthGuard';
import CalendarScreen from '@/components/screens/CalendarScreen';

export default function CalendarPage() {
  return (
    <AuthGuard>
      <CalendarScreen />
    </AuthGuard>
  );
}

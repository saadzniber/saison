'use client';
import { Suspense } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { PageLoader } from '@/components/layout/LoadingSpinner';
import SeasonalScreen from '@/components/screens/SeasonalScreen';

export default function SeasonalPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<PageLoader />}>
        <SeasonalScreen />
      </Suspense>
    </AuthGuard>
  );
}

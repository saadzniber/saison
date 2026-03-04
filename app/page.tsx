'use client';
import { useAuth } from '@/lib/auth';
import { PageLoader } from '@/components/layout/LoadingSpinner';
import AuthScreen from '@/components/screens/AuthScreen';
import OnboardingScreen from '@/components/screens/OnboardingScreen';
import HomeScreen from '@/components/screens/HomeScreen';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <AuthScreen />;
  if (!user.familyId) return <OnboardingScreen onComplete={() => window.location.reload()} />;

  return <HomeScreen />;
}

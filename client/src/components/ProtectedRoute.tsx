import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

export default function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Component {...rest} />;
}

import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  skipProfileCheck?: boolean;
  // Profile completion is now handled directly in Dashboard
  onJoinPage?: boolean;         // For join/login page
}

const ProtectedRoute = ({ 
  children, 
  adminOnly = false, 
  skipProfileCheck = false,
  onJoinPage = false
}: ProtectedRouteProps) => {
  const [, navigate] = useLocation();
  const { currentUser, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Debug log to track route protection state
  useEffect(() => {
    const authState = {
      loading,
      isLoggedIn: !!currentUser,
      adminOnly, 
      skipProfileCheck,
      onJoinPage,
      userDetails: currentUser ? {
        uid: currentUser.uid,
        isAdmin: currentUser.isAdmin || false,
      } : null
    };
    
    console.log("Auth state:", authState);
    setDebugInfo(authState);
  }, [currentUser, loading, adminOnly, skipProfileCheck, onJoinPage]);
  
  useEffect(() => {
    if (!loading) {
      console.log("Auth loading complete, checking redirect conditions");
      
      // Special case for join/login page - always allow access regardless of auth state
      if (onJoinPage) {
        console.log("On join/login page, no redirect needed");
        return;
      }
      
      if (!currentUser) {
        // Not logged in, redirect to login
        console.log("Not logged in, redirecting to login");
        navigate('/join?mode=login');
      } else if (adminOnly && !currentUser.isAdmin) {
        // Not an admin, but admin-only route
        console.log("Admin-only route, user is not admin, redirecting to dashboard");
        navigate('/dashboard');
      }
      // Profile completion is now handled on the Dashboard page
      // No need for separate profile completion page or redirection
    }
  }, [currentUser, loading, navigate, adminOnly, skipProfileCheck, onJoinPage]);
  
  // Show loading spinner
  if (loading) {
    console.log("Auth still loading, showing spinner");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // No more special case for profile completion - it's integrated into the Dashboard
  
  // Special case for join/login page - always render login page content regardless of auth state
  if (onJoinPage) {
    console.log("Rendering join/login page");
    return <>{children}</>;
  }
  
  // If not authorized, the redirect will happen in the useEffect
  // Return null while that happens
  if (!currentUser) {
    console.log("No current user, returning null");
    return null;
  }
  
  if (adminOnly && !currentUser.isAdmin) {
    console.log("Not an admin on admin-only route, returning null");
    return null;
  }
  
  // Profile completion check is now handled directly in the Dashboard
  // No separate profile completion page needed anymore
  
  // Render the protected content
  console.log("Rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;

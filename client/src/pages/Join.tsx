import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import Layout from '@/components/Layout';
import AuthForms from '@/components/auth/AuthForms';
import { useAuth } from '@/hooks/useAuth';
import { CONFIG } from '@/config';

const Join = () => {
  const [, navigate] = useLocation();
  const { currentUser, loading } = useAuth();
  const [, params] = useRoute('/join');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Get the mode from the URL query params
  const getQueryParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      mode: urlParams.get('mode') as 'login' | 'register' | null,
      ref: urlParams.get('ref'),
      subscribe: urlParams.get('subscribe') === 'true',
    };
  };
  
  const { mode, ref, subscribe } = getQueryParams();
  
  useEffect(() => {
    // Set the active tab based on the URL query parameter
    if (mode === 'login' || mode === 'register') {
      setActiveTab(mode);
    }
    
    // Update document title
    document.title = `${mode === 'register' ? 'Join' : 'Login'} | ${CONFIG.APP_NAME}`;
    
    // If user is already logged in and trying to access login page, redirect to dashboard
    if (currentUser && !loading) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [currentUser, loading, mode, navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <AuthForms
        activeTab={activeTab}
        referralCode={ref || undefined}
      />
    </Layout>
  );
};

export default Join;

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import AdminTabs from '@/components/admin/AdminTabs';
import { useAuth } from '@/hooks/useAuth';
import { CONFIG } from '@/config';

const Admin = () => {
  const [, navigate] = useLocation();
  const { currentUser, loading } = useAuth();
  
  // Set document title
  useEffect(() => {
    document.title = `Admin Panel | ${CONFIG.APP_NAME}`;
  }, []);
  
  // Check if user is logged in and is an admin
  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        navigate('/join?mode=login');
      } else if (!currentUser.isAdmin) {
        // If not an admin, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [currentUser, loading, navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  // If not an admin, should have been redirected by the useEffect
  if (!currentUser?.isAdmin) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminTabs username={currentUser.email || 'Admin'} />
      </div>
    </Layout>
  );
};

export default Admin;

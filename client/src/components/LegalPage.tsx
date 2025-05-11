import React from 'react';
import Layout from '@/components/Layout';
import { CONFIG } from '@/config';

interface LegalPageProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

const LegalPage: React.FC<LegalPageProps> = ({ title, lastUpdated, children }) => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card rounded-xl shadow-lg p-6 sm:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
            )}
          </div>
          
          <div className="prose prose-invert max-w-none">
            {children}
          </div>
          
          <div className="mt-10 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              If you have any questions about these terms, please contact us at{' '}
              <a href={`mailto:${CONFIG.SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {CONFIG.SUPPORT_EMAIL}
              </a>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegalPage;
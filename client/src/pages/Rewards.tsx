import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import RewardCalendarGrid from '@/components/calendar/RewardCalendarGrid';
import { CONFIG } from '@/config';

const Rewards = () => {
  // Set document title
  useEffect(() => {
    document.title = `Rewards | ${CONFIG.APP_NAME}`;
  }, []);

  const breadcrumbItems = [
    {
      href: "/rewards",
      label: "Rewards",
      current: true,
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} className="mb-4" />
          <h1 className="text-3xl font-bold text-white">Rewards</h1>
          <p className="text-muted-foreground">View upcoming weekly rewards and past winners</p>
        </div>
        
        <RewardCalendarGrid />
      </div>
    </Layout>
  );
};

export default Rewards;
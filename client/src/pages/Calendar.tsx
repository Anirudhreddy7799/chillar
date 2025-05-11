import { useEffect } from 'react';
import Layout from '@/components/Layout';
import RewardCalendarGrid from '@/components/calendar/RewardCalendarGrid';
import { CONFIG } from '@/config';

const Calendar = () => {
  // Set document title
  useEffect(() => {
    document.title = `Reward Calendar | ${CONFIG.APP_NAME}`;
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Reward Calendar</h1>
          <p className="text-muted-foreground">View upcoming weekly rewards and past winners</p>
        </div>
        
        <RewardCalendarGrid />
      </div>
    </Layout>
  );
};

export default Calendar;

import { useState, ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import Overview from './Overview';
import PendingClaims from './PendingClaims';
import RewardsManager from './RewardsManager';
import SubscribersTable from './SubscribersTable';
import ClaimsTable from './ClaimsTable';
import SettingsForm from './SettingsForm';

interface AdminTabsProps {
  username: string;
}

const AdminTabs = ({ username }: AdminTabsProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-muted-foreground">Manage rewards, subscribers, and claims</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary">
            <Shield className="mr-1 h-4 w-4" />
            Admin Access
          </span>
        </div>
      </div>
      
      <Card className="bg-card rounded-lg shadow-lg overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b border-border w-full flex overflow-x-auto scrollbar-hide">
            <TabsTrigger value="dashboard" className="py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="rewards" className="py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Rewards
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="claims" className="py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Claims
            </TabsTrigger>
            <TabsTrigger value="settings" className="py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Settings
            </TabsTrigger>
          </TabsList>
          
          <CardContent className="p-6">
            <TabsContent value="dashboard">
              <Overview />
            </TabsContent>
            
            <TabsContent value="rewards">
              <RewardsManager />
            </TabsContent>
            
            <TabsContent value="subscribers">
              <SubscribersTable />
            </TabsContent>
            
            <TabsContent value="claims">
              <ClaimsTable />
            </TabsContent>
            
            <TabsContent value="settings">
              <SettingsForm />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminTabs;

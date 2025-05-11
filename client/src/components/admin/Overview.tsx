import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Gift, Award, Wallet, ArrowUp, ArrowDown, ChevronRight, Info, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StatsData {
  subscriberCount: number;
  subscriberTrend: number;
  activeRewardsCount: number;
  rewardsTrend: number;
  pendingClaimsCount: number;
  monthlyRevenue: number;
  revenueTrend: number;
}

interface ClaimData {
  id: number;
  user: {
    email: string;
    id: string;
  };
  reward: {
    prizeName: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
}

const Overview = () => {
  const [stats, setStats] = useState<StatsData>({
    subscriberCount: 0,
    subscriberTrend: 0,
    activeRewardsCount: 0,
    rewardsTrend: 0,
    pendingClaimsCount: 0,
    monthlyRevenue: 0,
    revenueTrend: 0,
  });
  const [pendingClaims, setPendingClaims] = useState<ClaimData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app, would call actual API endpoints
      const [statsResponse, claimsResponse] = await Promise.all([
        apiRequest('GET', '/api/admin/stats', undefined),
        apiRequest('GET', '/api/claims/pending', undefined)
      ]);
      
      const statsData = await statsResponse.json();
      const claimsData = await claimsResponse.json();
      
      setStats(statsData);
      setPendingClaims(claimsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to load data. Please try again later.");
      
      // Fallback data for development
      setStats({
        subscriberCount: 248,
        subscriberTrend: 12,
        activeRewardsCount: 6,
        rewardsTrend: -2,
        pendingClaimsCount: 3,
        monthlyRevenue: 7440,
        revenueTrend: 8
      });
      
      setPendingClaims([
        {
          id: 1,
          user: { 
            email: "r****@outlook.com",
            id: "285931"
          },
          reward: { prizeName: "₹500 Amazon Voucher" },
          submittedAt: "2023-07-23T10:00:00Z",
          status: "pending"
        },
        {
          id: 2,
          user: { 
            email: "s****@gmail.com",
            id: "182756"
          },
          reward: { prizeName: "₹199 Mobile Recharge" },
          submittedAt: "2023-07-16T14:30:00Z",
          status: "pending"
        },
        {
          id: 3,
          user: { 
            email: "p****@yahoo.com",
            id: "392104"
          },
          reward: { prizeName: "₹250 Food Delivery" },
          submittedAt: "2023-07-09T09:15:00Z",
          status: "approved"
        }
      ]);
      
      setLoading(false);
    }
  };
  
  const handleClaimAction = async (claimId: number, action: 'approve' | 'reject' | 'info') => {
    if (action === 'info') {
      toast({
        title: "Claim Details",
        description: `Viewing details for claim #${claimId}`,
        duration: 3000,
      });
      return;
    }
    
    try {
      await apiRequest('PATCH', `/api/claims/${claimId}`, {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
      
      toast({
        title: action === 'approve' ? "Claim Approved" : "Claim Rejected",
        description: `Claim #${claimId} has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
        duration: 3000,
      });
      
      // Optimistically update the UI
      setPendingClaims(prev => 
        prev.map(claim => 
          claim.id === claimId 
            ? { ...claim, status: action === 'approve' ? 'approved' : 'rejected' } 
            : claim
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing claim:`, error);
      toast({
        title: "Action Failed",
        description: `Failed to ${action} claim #${claimId}. Please try again.`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowUp className="text-success text-xs mr-1" />;
    } else if (trend < 0) {
      return <ArrowDown className="text-error text-xs mr-1" />;
    }
    return null;
  };
  
  const getTrendText = (trend: number) => {
    if (trend === 0) return "No change";
    const absValue = Math.abs(trend);
    return `${absValue}% ${trend > 0 ? 'increase' : 'decrease'} ${trend < 0 && trend > -10 ? 'this month' : 'from last month'}`;
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, index) => (
            <Card key={index} className="bg-muted animate-pulse h-28" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-error mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-muted rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <Users className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Subscribers</p>
                    <p className="text-2xl font-bold text-white">{stats.subscriberCount}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-success flex items-center">
                  {getTrendIcon(stats.subscriberTrend)}
                  {getTrendText(stats.subscriberTrend)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mr-4">
                    <Gift className="text-secondary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Rewards</p>
                    <p className="text-2xl font-bold text-white">{stats.activeRewardsCount}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-warning flex items-center">
                  {getTrendIcon(stats.rewardsTrend)}
                  {stats.rewardsTrend < 0 ? `${Math.abs(stats.rewardsTrend)} rewards ended this week` : getTrendText(stats.rewardsTrend)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mr-4">
                    <Award className="text-success h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Claims</p>
                    <p className="text-2xl font-bold text-white">{stats.pendingClaimsCount}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {stats.pendingClaimsCount > 0 ? "Needs your attention" : "No pending claims"}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                    <Wallet className="text-accent h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.monthlyRevenue)}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-success flex items-center">
                  {getTrendIcon(stats.revenueTrend)}
                  {getTrendText(stats.revenueTrend)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Pending Claims</h2>
              <Button variant="link" className="text-secondary text-sm">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              {pendingClaims.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No pending claims to review.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingClaims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
                              <span className="text-white font-medium text-sm">{claim.user.email.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{claim.user.email}</p>
                              <p className="text-xs text-muted-foreground">User ID: {claim.user.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm text-white">{claim.reward.prizeName}</p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm text-muted-foreground">
                            {new Date(claim.submittedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full 
                            ${claim.status === 'pending' ? 'bg-warning/20 text-warning' : ''}
                            ${claim.status === 'approved' ? 'bg-success/20 text-success' : ''}
                            ${claim.status === 'rejected' ? 'bg-error/20 text-error' : ''}
                          `}>
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex space-x-2">
                            {claim.status === 'pending' && (
                              <>
                                <Button 
                                  size="icon"
                                  variant="outline"
                                  className="p-1 rounded bg-success/20 hover:bg-success/40 transition"
                                  onClick={() => handleClaimAction(claim.id, 'approve')}
                                >
                                  <Check className="text-success h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon"
                                  variant="outline"
                                  className="p-1 rounded bg-error/20 hover:bg-error/40 transition"
                                  onClick={() => handleClaimAction(claim.id, 'reject')}
                                >
                                  <X className="text-error h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button 
                              size="icon"
                              variant="outline"
                              className="p-1 rounded bg-primary/20 hover:bg-primary/40 transition"
                              onClick={() => handleClaimAction(claim.id, 'info')}
                            >
                              <Info className="text-primary h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;

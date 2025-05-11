import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Subscription {
  id: number;
  userId: number;
  razorpaySubId: string | null;
  razorpayCustomerId: string | null;
  planId: string;
  status: string;
  startDate: string;
  endDate: string | null;
  amount: number;
  currency: string;
  isActive: boolean;
  metadata: string;
}

export default function SubscriptionStatus({ userId, uid }: { userId: number; uid: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [percentRemaining, setPercentRemaining] = useState<number>(0);
  
  // Fetch subscription data
  const { data: subscription, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription', uid],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/user/subscription/${uid}`);
        if (!response.ok) {
          // For 404 responses, return null (no subscription) instead of throwing
          if (response.status === 404) {
            return null;
          }
          throw new Error('Could not fetch subscription data');
        }
        return await response.json() as Subscription;
      } catch (err) {
        console.error('Error fetching subscription:', err);
        return null;
      }
    },
    staleTime: 60000, // 1 minute
  });

  // Calculate days remaining when subscription data changes
  useEffect(() => {
    if (subscription?.endDate) {
      const end = new Date(subscription.endDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      
      setDaysRemaining(days);
      
      // Calculate percentage remaining for progress bar
      const start = new Date(subscription.startDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const percent = Math.min(100, Math.max(0, Math.round((days / totalDays) * 100)));
      setPercentRemaining(percent);
    } else {
      setDaysRemaining(null);
      setPercentRemaining(0);
    }
  }, [subscription]);

  // Subscription cancellation mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await apiRequest('POST', '/api/cancel-subscription', {
        subscriptionId
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      
      // Invalidate queries to refetch subscription data
      queryClient.invalidateQueries({ queryKey: ['subscription', uid] });
    },
    onError: (error) => {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel your subscription. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Function to handle cancellation
  const handleCancelSubscription = () => {
    // Handle null or development mode subscriptions
    const subscriptionId = subscription?.razorpaySubId || `mock_sub_${Date.now()}`;
    
    if (!confirm('Are you sure you want to cancel your subscription? This cannot be undone.')) {
      return;
    }
    
    cancelSubscriptionMutation.mutate(subscriptionId);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>There was an error loading your subscription information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle size={18} />
            <p>Failed to load subscription data. Please try again later.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => refetch()} variant="outline">Try Again</Button>
        </CardFooter>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>You don't have an active subscription yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Subscribe to Chillar Club to access exclusive rewards and daily draws.
            </p>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>Subscription plans start from just ₹1/day!</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => setLocation('/subscribe')}
          >
            Subscribe Now
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Display active subscription
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>
              {subscription.planId === 'monthly' ? 'Monthly' : 'Annual'} Plan 
              {' • '} 
              {formatCurrency(subscription.amount, subscription.currency)}
            </CardDescription>
          </div>
          <Badge variant={subscription.isActive ? "default" : "destructive"}>
            {subscription.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.isActive && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subscription Period</span>
              <span className="font-medium">
                {formatDate(subscription.startDate)} - {subscription.endDate ? formatDate(subscription.endDate) : 'Ongoing'}
              </span>
            </div>
            
            {daysRemaining !== null && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Time Remaining</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock size={16} />
                    {daysRemaining} days left
                  </span>
                </div>
                <Progress value={percentRemaining} />
              </div>
            )}
            
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle size={18} />
              <span>Your subscription is active and you're eligible for all rewards</span>
            </div>
          </>
        )}
        
        {!subscription.isActive && subscription.status !== 'cancelled' && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle size={18} />
            <span>Your subscription needs attention. Please update payment details.</span>
          </div>
        )}
        
        {subscription.status === 'cancelled' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle size={18} />
            <span>Your subscription has been cancelled and will end on {formatDate(subscription.endDate || '')}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {subscription.isActive && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleCancelSubscription}
            disabled={cancelSubscriptionMutation.isPending}
          >
            {cancelSubscriptionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </Button>
        )}
        
        {!subscription.isActive && (
          <Button 
            className="w-full" 
            onClick={() => setLocation('/subscribe')}
          >
            {subscription.status === 'cancelled' ? 'Resubscribe' : 'Update Subscription'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
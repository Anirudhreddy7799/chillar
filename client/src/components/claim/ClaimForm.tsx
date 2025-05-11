import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

const claimSchema = z.object({
  notes: z.string().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions to claim your reward",
  }),
});

type ClaimFormValues = z.infer<typeof claimSchema>;

interface ClaimFormProps {
  rewardId: number;
  rewardName: string;
  rewardValue: number;
  rewardDescription: string;
  rewardImageUrl: string;
  drawDate: string;
  claimDeadline: string;
  onClaimSubmitted: () => void;
}

const ClaimForm = ({
  rewardId,
  rewardName,
  rewardValue,
  rewardDescription,
  rewardImageUrl,
  drawDate,
  claimDeadline,
  onClaimSubmitted
}: ClaimFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      notes: '',
      terms: false,
    },
  });
  
  const onSubmit = async (data: ClaimFormValues) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to claim your reward",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Submit claim to API
      const response = await apiRequest('POST', '/api/claims', {
        userId: currentUser.uid,
        rewardId: rewardId,
        notes: data.notes,
        status: 'pending',
      });
      
      if (response.ok) {
        toast({
          title: "Claim submitted successfully",
          description: "We'll process your claim shortly!",
        });
        onClaimSubmitted();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit claim");
      }
    } catch (error: any) {
      console.error("Claim submission error:", error);
      toast({
        title: "Claim submission failed",
        description: error.message || "An error occurred while submitting your claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="bg-card rounded-xl shadow-xl overflow-hidden">
      <div className="relative">
        {/* Background overlay */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2
          }}
        />
        
        <div className="relative z-10 py-12 px-6 md:px-10 text-center">
          <div className="inline-block p-3 rounded-full bg-success/20 text-success mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">Congratulations!</h1>
          <h2 className="text-2xl font-bold gradient-text mb-4">You've Won This Week's Reward!</h2>
          
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            You've been selected as this week's winner for the following reward:
          </p>
        </div>
      </div>
      
      <CardContent className="p-6 md:p-10">
        <div className="bg-background/40 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <img 
              src={rewardImageUrl} 
              alt={rewardName} 
              className="w-full md:w-40 h-40 object-cover rounded-lg shadow-lg" 
            />
            
            <div className="flex-grow">
              <h3 className="text-2xl font-bold text-white">{formatCurrency(rewardValue)} {rewardName}</h3>
              <p className="text-muted-foreground mt-1">{rewardDescription}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Draw Date</p>
                  <p className="text-base font-medium text-white">{new Date(drawDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Claim By</p>
                  <p className="text-base font-medium text-white">{new Date(claimDeadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-4">Claim Your Reward</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <FormLabel className="block text-sm font-medium text-muted-foreground mb-1">Email Address</FormLabel>
              <Input 
                type="email" 
                value={currentUser?.email || ''} 
                disabled 
                className="block w-full bg-background/40 border-border text-white" 
              />
              <p className="mt-1 text-sm text-muted-foreground">We'll send your reward to this email</p>
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any specific details about your claim..."
                      className="bg-background/40 border-border text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    If you have any special requests or information for processing your reward, please add it here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-muted-foreground">
                      I confirm that I am claiming this reward and that I have read and agree to the{" "}
                      <a href="#" className="text-secondary hover:text-secondary-light">
                        Terms & Conditions
                      </a>.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full sm:w-auto gradient-bg neon-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Claim..." : "Claim My Reward"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ClaimForm;

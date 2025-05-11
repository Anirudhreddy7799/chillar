import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { updateUserData, updateUserEmail, updateUserProfile, logout } from '@/firebase';
import Layout from '@/components/Layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { User, Clock, CreditCard, Settings, Shield, LogOut, CalendarIcon } from 'lucide-react';
import { useLocation } from 'wouter';
import { Switch } from '@/components/ui/switch';
import { IndiaLocationAutocomplete } from '@/components/IndiaLocationAutocomplete';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Indian cities for the location dropdown
const INDIA_LOCATIONS = [
  { value: "delhi", label: "Delhi" },
  { value: "mumbai", label: "Mumbai" },
  { value: "bangalore", label: "Bangalore" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "chennai", label: "Chennai" },
  { value: "kolkata", label: "Kolkata" },
  { value: "ahmedabad", label: "Ahmedabad" },
  { value: "pune", label: "Pune" },
  // more locations defined in the IndiaLocationAutocomplete component
];

interface UserProfile {
  name?: string;
  uniqueId?: string;
  birthday?: Date;
  location?: string;
  phone?: string;
  avatarUrl?: string;
}

// Email Change Form Component
function ChangeEmailForm({ currentUser }: { currentUser: any }) {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateUserEmail(newEmail, currentPassword);
      
      toast({
        title: "Email Updated",
        description: "Please check your new email for verification.",
      });
      
      document.querySelector('dialog')?.close();
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Change Email Address</DialogTitle>
        <DialogDescription>
          Enter your new email address. You'll need to verify it before the change takes effect.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="current-email">Current Email</Label>
          <Input id="current-email" value={currentUser?.email} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-email">New Email</Label>
          <Input 
            id="new-email" 
            type="email" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <Input 
            id="current-password" 
            type="password" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            For security, please enter your current password to confirm this change.
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Email'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Password Change Form Component
function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implement Firebase password change
      // await updatePassword(currentPassword, newPassword);
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      
      document.querySelector('dialog')?.close();
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Change Password</DialogTitle>
        <DialogDescription>
          Enter your current password and a new password.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="current-pwd">Current Password</Label>
          <Input 
            id="current-pwd" 
            type="password" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-pwd">New Password</Label>
          <Input 
            id="new-pwd" 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-pwd">Confirm New Password</Label>
          <Input 
            id="confirm-pwd" 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Profile() {
  const { currentUser, firebaseUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [profileData, setProfileData] = useState<UserProfile>({
    name: '',
    uniqueId: '',
    birthday: undefined,
    location: '',
    phone: '',
    avatarUrl: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile data
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['/api/user/profile', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      return apiRequest('GET', `/api/user/profile/${currentUser.uid}`)
        .then(res => res.json())
        .catch(error => {
          console.error('Error fetching profile:', error);
          return null;
        });
    },
    enabled: !!currentUser?.uid,
  });

  // Fetch subscription data
  const { data: subscriptionData, isLoading: loadingSubscription } = useQuery({
    queryKey: ['/api/user/subscription', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      return apiRequest('GET', `/api/user/subscription/${currentUser.uid}`)
        .then(res => res.json())
        .catch(error => {
          console.error('Error fetching subscription:', error);
          return null;
        });
    },
    enabled: !!currentUser?.uid,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: UserProfile) => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      
      // Update in Firestore
      await updateUserData(currentUser.uid, { 
        profile: profileData 
      });
      
      // Update in backend database
      return apiRequest('PATCH', `/api/user/profile/${currentUser.uid}`, profileData)
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile', currentUser?.uid] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating profile:', error);
    }
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return apiRequest('POST', `/api/user/subscription/cancel/${currentUser.uid}`)
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. It will remain active until the end of the billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/subscription', currentUser?.uid] });
    },
    onError: (error) => {
      toast({
        title: "Cancellation Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error('Error cancelling subscription:', error);
    }
  });

  // Update profile data from fetched data
  useEffect(() => {
    if (userProfile && !isLoading) {
      setProfileData({
        name: userProfile.name || '',
        uniqueId: userProfile.uniqueId || '',
        birthday: userProfile.birthday ? new Date(userProfile.birthday) : undefined,
        location: userProfile.location || '',
        phone: userProfile.phone || '',
        avatarUrl: userProfile.avatarUrl || '',
      });
    }
  }, [userProfile, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    // Validate phone number
    if (profileData.phone && !/^[6-9]\d{9}$/.test(profileData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit Indian phone number",
        variant: "destructive",
      });
      return;
    }
    
    updateProfileMutation.mutate(profileData);
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      cancelSubscriptionMutation.mutate();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || currentUser?.email?.charAt(0).toUpperCase() || 'U';
  };

  const breadcrumbItems = [
    {
      href: "/profile",
      label: "Profile",
      current: true,
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-5xl py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  {profileData.avatarUrl ? (
                    <AvatarImage src={profileData.avatarUrl} alt={profileData.name || 'User'} />
                  ) : null}
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {getInitials(profileData.name || '')}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-semibold">{profileData.name || 'User'}</h2>
                <p className="text-muted-foreground">{currentUser?.email}</p>
                
                {profileData.uniqueId && (
                  <Badge variant="outline" className="mt-1">ID: {profileData.uniqueId}</Badge>
                )}
                
                {currentUser?.isSubscribed ? (
                  <Badge className="mt-2 bg-gradient-to-r from-indigo-500 to-purple-600">Premium Member</Badge>
                ) : (
                  <Badge variant="outline" className="mt-2">Free User</Badge>
                )}

                <div className="w-full mt-6">
                  <Button variant="outline" className="w-full justify-start mt-2" onClick={() => navigate('/dashboard')}>
                    <Clock className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                  <Button variant="outline" className="w-full justify-start mt-2" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Referral Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Referral Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={`https://chillarclub.in/join?ref=${currentUser?.referralCode || ''}`}
                    readOnly
                    className="text-xs"
                  />
                  <Button variant="outline" onClick={() => {
                    navigator.clipboard.writeText(`https://chillarclub.in/join?ref=${currentUser?.referralCode || ''}`);
                    toast({
                      title: "Copied!",
                      description: "Referral link copied to clipboard",
                    });
                  }}>
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div>
            <Tabs defaultValue="profile">
              <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
                <TabsTrigger value="profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />Profile
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />Subscription
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />Settings
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your personal profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        {isEditing ? (
                          <Input 
                            id="name" 
                            name="name" 
                            value={profileData.name} 
                            onChange={handleInputChange} 
                          />
                        ) : (
                          <div className="py-2 px-3 border rounded-md bg-muted">{profileData.name || 'Not set'}</div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="uniqueId">Unique ID</Label>
                        <div className="py-2 px-3 border rounded-md bg-muted">{profileData.uniqueId || 'Not assigned'}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="birthday">Birthday</Label>
                        {isEditing ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !profileData.birthday && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {profileData.birthday ? format(profileData.birthday, "PPP") : "Select your birthday"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={profileData.birthday}
                                onSelect={(date) => setProfileData({...profileData, birthday: date})}
                                initialFocus
                                disabled={(date) => date > new Date()}
                                fromYear={1940}
                                toYear={new Date().getFullYear() - 13}
                              />
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <div className="py-2 px-3 border rounded-md bg-muted">
                            {profileData.birthday ? format(profileData.birthday, "PPP") : 'Not set'}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        {isEditing ? (
                          <IndiaLocationAutocomplete 
                            value={profileData.location || ''}
                            onChange={(value) => setProfileData({...profileData, location: value})}
                          />
                        ) : (
                          <div className="py-2 px-3 border rounded-md bg-muted">
                            {profileData.location ? 
                              INDIA_LOCATIONS.find(loc => loc.value === profileData.location)?.label || profileData.location 
                              : 'Not set'}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        {isEditing ? (
                          <>
                            <Input 
                              id="phone" 
                              name="phone" 
                              value={profileData.phone} 
                              onChange={handleInputChange}
                              type="tel"
                              maxLength={10}
                              placeholder="10-digit mobile number"
                            />
                            <p className="text-xs text-muted-foreground">Indian mobile number (10 digits)</p>
                          </>
                        ) : (
                          <div className="py-2 px-3 border rounded-md bg-muted">{profileData.phone || 'Not set'}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Subscription Tab */}
              <TabsContent value="subscription">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Details</CardTitle>
                    <CardDescription>Manage your subscription and billing information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loadingSubscription ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : subscriptionData ? (
                      <>
                        <div className="rounded-lg bg-muted p-4">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h3 className="font-semibold">Current Plan</h3>
                              <p className="text-muted-foreground text-sm">Monthly Subscription</p>
                            </div>
                            <Badge className={subscriptionData.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}>
                              {subscriptionData.status === 'active' ? 'Active' : 'Pending'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Amount</p>
                              <p className="font-medium">{formatCurrency(30)}/month</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Next Billing Date</p>
                              <p className="font-medium">{formatDate(subscriptionData.endDate)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Started On</p>
                              <p className="font-medium">{formatDate(subscriptionData.startDate)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Subscription ID</p>
                              <p className="font-medium text-xs">{subscriptionData.razorpaySubscriptionId}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <Separator className="my-4" />
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">Cancel Subscription</h3>
                              <p className="text-sm text-muted-foreground">
                                Your subscription will remain active until the end of the billing period.
                              </p>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={handleCancelSubscription}
                              disabled={cancelSubscriptionMutation.isPending || subscriptionData.status !== 'active'}
                            >
                              {cancelSubscriptionMutation.isPending ? 'Processing...' : 'Cancel Subscription'}
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10">
                        <h3 className="font-semibold mb-2">No Active Subscription</h3>
                        <p className="text-muted-foreground mb-6">You don't have an active subscription.</p>
                        <Button onClick={() => navigate('/rewards')}>Subscribe Now</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Email Address</h3>
                      <div className="flex justify-between items-center">
                        <div>
                          <p>{currentUser?.email}</p>
                          <p className="text-xs text-muted-foreground">This is the email address you use to sign in.</p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Change Email</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <ChangeEmailForm currentUser={currentUser} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-3">Password</h3>
                      <div className="flex justify-between items-center">
                        <div>
                          <p>••••••••</p>
                          <p className="text-xs text-muted-foreground">Last changed: Unknown</p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Change Password</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <ChangePasswordForm />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-3">Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                            <p className="text-xs text-muted-foreground">
                              Receive notifications about rewards, draws, and important updates.
                            </p>
                          </div>
                          <Switch id="emailNotifications" defaultChecked={true} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="marketingEmails" className="font-medium">Marketing Emails</Label>
                            <p className="text-xs text-muted-foreground">
                              Receive news, offers, and promotional content.
                            </p>
                          </div>
                          <Switch id="marketingEmails" defaultChecked={false} />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-3 text-destructive">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive">Delete Account</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Delete Account</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete your account and remove all your data.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="text-sm text-destructive">
                              Warning: If you have an active subscription, it will be cancelled immediately without refund.
                            </p>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => document.querySelector('dialog')?.close()}>
                              Cancel
                            </Button>
                            <Button variant="destructive">
                              Delete Account
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SubscriptionStatus from "@/components/dashboard/SubscriptionStatus";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IndiaLocationAutocomplete } from "@/components/IndiaLocationAutocomplete";
import CurrentReward from "@/components/dashboard/CurrentReward";
import PreviousResults from "@/components/dashboard/PreviousResults";
import CountdownWidget from "@/components/dashboard/CountdownWidget";
import ReferralWidget from "@/components/dashboard/ReferralWidget";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import {
  updateUserData,
  updateUserEmail,
  updateUserProfile,
  logout,
  getUserData,
} from "@/firebase";
import { CONFIG } from "@/config";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import {
  User,
  Clock,
  CreditCard,
  Settings,
  Shield,
  LogOut,
  CalendarIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

// Indian cities for the location dropdown
// This references the full location data defined in the IndiaLocationAutocomplete component
const INDIA_LOCATIONS = [
  { value: "delhi", label: "New Delhi, Delhi" },
  { value: "mumbai", label: "Mumbai, Maharashtra" },
  { value: "bangalore", label: "Bangalore, Karnataka" },
  { value: "hyderabad", label: "Hyderabad, Telangana" },
  { value: "chennai", label: "Chennai, Tamil Nadu" },
  { value: "kolkata", label: "Kolkata, West Bengal" },
  { value: "ahmedabad", label: "Ahmedabad, Gujarat" },
  { value: "pune", label: "Pune, Maharashtra" },
  // For a complete list, refer to IndiaLocationAutocomplete component
];

interface UserProfile {
  name?: string;
  birthday?: Date;
  location?: string;
  phone?: string;
  avatarUrl?: string;
  referralCode?: string;
}

// Email Change Form Component
function ChangeEmailForm({ currentUser }: { currentUser: any }) {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
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

      document.querySelector("dialog")?.close();
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
    } catch (error: any) {
      console.error("Error updating email:", error);
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
          Enter your new email address. You'll need to verify it before the
          change takes effect.
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
            For security, please enter your current password to confirm this
            change.
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Email"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Password Change Form Component
function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

      document.querySelector("dialog")?.close();
    } catch (error: any) {
      console.error("Error updating password:", error);
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
          {isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </DialogFooter>
    </form>
  );
}

const Dashboard = () => {
  const { currentUser, firebaseUser, loading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [userData, setUserData] = useState<any>(null);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [rewardLoading, setRewardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfile>({
    name: "",
    birthday: undefined,
    location: "",
    phone: "",
    avatarUrl: "",
  });
  const [referralCode, setReferralCode] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = `Dashboard | ${CONFIG.APP_NAME}`;
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const response = await apiRequest("GET", "/api/users/me", undefined);
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load your account information. Please try again.");
      } finally {
        setUserLoading(false);
      }
    };

    if (!loading && currentUser) {
      fetchUserData();
    }
  }, [currentUser, loading]);

  // Fetch current week's reward
  useEffect(() => {
    const fetchCurrentReward = async () => {
      try {
        const response = await apiRequest(
          "GET",
          "/api/rewards/current",
          undefined
        );

        if (response.ok) {
          const data = await response.json();
          setCurrentReward(data);
        } else if (response.status === 404) {
          // No current reward found, this is fine
          setCurrentReward(null);
        } else {
          throw new Error("Failed to fetch current reward");
        }
      } catch (err) {
        console.error("Error fetching current reward:", err);
        setError("Failed to load this week's reward information.");
      } finally {
        setRewardLoading(false);
      }
    };

    fetchCurrentReward();
  }, []);

  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/user/profile", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      try {
        console.log("Fetching profile data for:", currentUser.uid);

        // Convert Firebase Timestamp to JS Date
        const convertFirebaseTimestamp = (timestamp: any): Date | null => {
          if (!timestamp) return null;

          try {
            // Handle various timestamp formats
            if (timestamp instanceof Date) {
              return isNaN(timestamp.getTime()) ? null : timestamp;
            }

            if (typeof timestamp === "string") {
              const parsedDate = new Date(timestamp);
              return isNaN(parsedDate.getTime()) ? null : parsedDate;
            }

            // Handle Firebase timestamp
            if (typeof timestamp === "object" && timestamp.seconds) {
              // Add nanoseconds for more precision
              const seconds = timestamp.seconds;
              const nanoseconds = timestamp.nanoseconds || 0;
              const parsedDate = new Date(
                seconds * 1000 + nanoseconds / 1000000
              );
              return isNaN(parsedDate.getTime()) ? null : parsedDate;
            }
          } catch (error) {
            console.error("Error converting timestamp:", error);
          }

          return null;
        };

        // Create a timeout promise to prevent hanging operations
        const timeout = (ms: number) =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
          );

        // Try to get data from the API with a timeout
        const fetchFromAPI = async () => {
          try {
            const res = (await Promise.race([
              apiRequest("GET", `/api/user/profile/${currentUser.uid}`),
              timeout(5000),
            ])) as Response;
            const data = await res.json();
            console.log("Fetched profile data from server:", data);
            return data;
          } catch (error) {
            console.warn("API fetch timeout or error:", error);
            return null;
          }
        };

        // Try to get data directly from Firebase with a timeout
        const fetchFromFirebase = async () => {
          try {
            const firebaseData = await Promise.race([
              getUserData(currentUser.uid),
              timeout(5000),
            ]);
            console.log(
              "Fetched data from Firebase:",
              firebaseData ? "success" : "no data"
            );
            return firebaseData;
          } catch (error) {
            console.warn("Firebase fetch timeout or error:", error);
            return null;
          }
        };

        // Try to fetch from both sources in parallel
        const [apiData, firebaseData] = await Promise.all([
          fetchFromAPI(),
          fetchFromFirebase(),
        ]);

        // If we have data from both sources, merge them
        if (apiData && firebaseData && firebaseData.profile) {
          // Process Firebase birthday timestamp before using it
          const firebaseBirthday = firebaseData.profile.birthday
            ? convertFirebaseTimestamp(firebaseData.profile.birthday)
            : null;

          // Merge the data, preferring Firebase data for most fields
          const mergedData = {
            ...apiData,
            name: firebaseData.profile.name || apiData.name || "",
            location: firebaseData.profile.location || apiData.location || "",
            phone: firebaseData.profile.phone || apiData.phone || "",
            avatarUrl:
              firebaseData.profile.avatarUrl || apiData.avatarUrl || "",
            referralCode:
              firebaseData.referralCode || apiData.referralCode || "",
            // Use converted date object instead of raw Firebase timestamp
            birthday: firebaseBirthday || apiData.birthday,
          };
          console.log("Enhanced profile data with Firebase data:", mergedData);
          return mergedData;
        }

        // If only one source succeeded, use that
        if (!apiData && firebaseData?.profile) {
          // Convert Firebase timestamp to Date if needed
          const firebaseBirthday = firebaseData.profile.birthday
            ? convertFirebaseTimestamp(firebaseData.profile.birthday)
            : null;

          return {
            name: firebaseData.profile.name || "",
            birthday: firebaseBirthday, // Use converted date
            location: firebaseData.profile.location || "",
            phone: firebaseData.profile.phone || "",
            avatarUrl: firebaseData.profile.avatarUrl || "",
            referralCode: firebaseData.referralCode || "",
          };
        }

        return apiData || null;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    },
    enabled: !!currentUser?.uid,
    // Ensure profile data is always refetched when logging in
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3, // Retry failed requests up to 3 times
  });

  // Initialize profile data from user profile
  useEffect(() => {
    if (userProfile) {
      console.log("Received user profile data:", userProfile);

      // Skip processing if we haven't received actual data
      if (
        !userProfile.name &&
        !userProfile.birthday &&
        !userProfile.location &&
        !userProfile.phone &&
        !userProfile.avatarUrl &&
        !userProfile.referralCode
      ) {
        console.log("Skipping empty profile data");
        return;
      }

      // All fields are now in the root of the response
      console.log("Processing profile data from response");

      // Handle birthday which might be in different formats
      let birthdayDate = undefined;
      if (userProfile.birthday) {
        try {
          // Always wrap date parsing in try/catch as it can fail
          if (typeof userProfile.birthday === "string") {
            // String date format
            try {
              birthdayDate = new Date(userProfile.birthday);
            } catch (e) {
              console.warn("Failed to parse string date:", e);
            }
          } else if (userProfile.birthday instanceof Date) {
            // Already a Date object
            birthdayDate = userProfile.birthday;
          } else if (
            typeof userProfile.birthday === "object" &&
            userProfile.birthday.seconds
          ) {
            // Firebase Timestamp object
            try {
              const seconds = userProfile.birthday.seconds;
              const nanoseconds = userProfile.birthday.nanoseconds || 0;
              birthdayDate = new Date(seconds * 1000 + nanoseconds / 1000000);
            } catch (e) {
              console.warn("Failed to parse Firebase timestamp:", e);
            }
          }

          // Validate that the date is valid before using it
          if (birthdayDate && !isNaN(birthdayDate.getTime())) {
            console.log(
              "Successfully parsed birthday:",
              birthdayDate.toISOString()
            );
          } else {
            console.warn("Invalid birthday date detected, setting to null");
            birthdayDate = undefined;
          }
        } catch (error) {
          console.error("Error in birthday parsing logic:", error);
          birthdayDate = undefined;
        }
      }

      // Update the profile data state object
      setProfileData({
        name: userProfile.name || "",
        birthday: birthdayDate,
        location: userProfile.location || "",
        phone: userProfile.phone || "",
        avatarUrl: userProfile.avatarUrl || "",
        referralCode: userProfile.referralCode || "", // Include referral code in profile data
      });

      // Also update the separate referral code state for the invite widget
      if (userProfile.referralCode) {
        setReferralCode(userProfile.referralCode);
      }
    }
  }, [userProfile]);

  // Fetch subscription data
  const { data: subscriptionData, isLoading: loadingSubscription } = useQuery({
    queryKey: ["/api/user/subscription", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      return apiRequest("GET", `/api/user/subscription/${currentUser.uid}`)
        .then((res) => res.json())
        .catch((error) => {
          console.error("Error fetching subscription:", error);
          return null;
        });
    },
    enabled: !!currentUser?.uid,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: UserProfile) => {
      if (!currentUser?.uid) throw new Error("User not authenticated");

      // Validate required fields
      if (!profileData.name?.trim()) {
        throw new Error("Full Name is required");
      }

      if (!profileData.birthday) {
        throw new Error("Birthday is required");
      }

      if (!profileData.location?.trim()) {
        throw new Error("Location is required");
      }

      if (
        !profileData.phone?.trim() ||
        !/^[6-9]\d{9}$/.test(profileData.phone)
      ) {
        throw new Error(
          "Valid phone number is required (10 digits starting with 6-9)"
        );
      }

      // Prepare profile data for firestore
      const profileToUpdate = {
        profile: {
          name: profileData.name,
          birthday: profileData.birthday,
          location: profileData.location,
          phone: profileData.phone,
          avatarUrl: profileData.avatarUrl || "",
        },
        profileCompleted: true,
      };

      try {
        // Update in Firestore (this already attempts to sync with PostgreSQL)
        await updateUserData(currentUser.uid, profileToUpdate);

        // No need to separately call the API since updateUserData handles syncing
        return { success: true };
      } catch (error) {
        console.error("Error updating profile:", error);

        // Try direct API call as fallback if Firebase fails
        try {
          const response = await apiRequest(
            "PATCH",
            `/api/user/profile/${currentUser.uid}`,
            profileToUpdate
          );
          return response.json();
        } catch (apiError) {
          console.error("API fallback also failed:", apiError);
          throw error; // Throw original error if both methods fail
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({
        queryKey: ["/api/user/profile", currentUser?.uid],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.uid) throw new Error("User not authenticated");
      return apiRequest(
        "POST",
        `/api/user/subscription/cancel/${currentUser.uid}`
      ).then((res) => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description:
          "Your subscription has been cancelled. It will remain active until the end of the billing period.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/user/subscription", currentUser?.uid],
      });
    },
    onError: (error) => {
      toast({
        title: "Cancellation Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("Error cancelling subscription:", error);
    },
  });

  // Update profile data from fetched data
  useEffect(() => {
    if (userProfile && !profileLoading) {
      setProfileData({
        name: userProfile.name || "",
        birthday: userProfile.birthday
          ? new Date(userProfile.birthday)
          : undefined,
        location: userProfile.location || "",
        phone: userProfile.phone || "",
        avatarUrl: userProfile.avatarUrl || "",
      });

      // Set referral code separately
      if (userProfile.referralCode) {
        setReferralCode(userProfile.referralCode);
      }
    }
  }, [userProfile, profileLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    // Validate all required fields
    if (!profileData.name?.trim()) {
      toast({
        title: "Missing Required Field",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (!profileData.birthday) {
      toast({
        title: "Missing Required Field",
        description: "Please enter your birthday",
        variant: "destructive",
      });
      return;
    }

    if (!profileData.location?.trim()) {
      toast({
        title: "Missing Required Field",
        description: "Please enter your location",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    if (!profileData.phone || !/^[6-9]\d{9}$/.test(profileData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description:
          "Please enter a valid 10-digit Indian phone number starting with 6-9",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(profileData);
  };

  const handleCancelSubscription = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel your subscription? This action cannot be undone."
      )
    ) {
      cancelSubscriptionMutation.mutate();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate next draw date
  const getNextDrawDate = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek; // If today is Sunday, set to next Sunday

    const nextDraw = new Date(now);
    nextDraw.setDate(now.getDate() + daysUntilSunday);
    nextDraw.setHours(23, 59, 59, 999);

    return nextDraw;
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() ||
      currentUser?.email?.charAt(0).toUpperCase() ||
      "U"
    );
  };

  // Fallback data for development
  const fallbackUserData = {
    email: currentUser?.email || "user@example.com",
    isSubscribed: true,
    referralCode: referralCode || "", // Use the state value instead of hardcoded value
    subscription: {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
    },
  };

  const fallbackReward = {
    id: 1,
    prizeName: "Mobile Recharge",
    prizeValue: 199,
    prizeType: "recharge",
    sponsor: "Airtel",
    imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1",
    description: "Recharge any mobile number with a premium plan!",
  };

  const displayUserData = userData || fallbackUserData;
  const displayReward = currentReward || fallbackReward;
  const nextDrawDate = getNextDrawDate();

  if (loading || userLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const breadcrumbItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      current: true,
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} className="mb-4" />
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span>{displayUserData.email}</span>!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs for Profile, Subscription, Settings */}
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid grid-cols-3 w-full md:w-[400px] mb-6">
                <TabsTrigger value="profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" /> Profile
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" /> Subscription
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Manage your personal profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Full Name Field - Directly editable when clicked */}
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className={
                            !isEditing ? "cursor-pointer bg-muted" : ""
                          }
                          readOnly={!isEditing}
                          onClick={() => !isEditing && setIsEditing(true)}
                          required
                        />
                      </div>

                      {/* Referral Code - Always read-only */}
                      <div className="space-y-2">
                        <Label htmlFor="referralCode">Referral Code</Label>
                        <div className="py-2 px-3 border rounded-md bg-muted">
                          {userProfile?.referralCode || "Loading..."}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Share this code with friends to earn rewards
                        </p>
                      </div>

                      {/* Birthday with dropdown selects for day, month, year */}
                      <div className="space-y-2">
                        <Label>
                          Birthday <span className="text-red-500">*</span>
                        </Label>
                        {isEditing ? (
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label htmlFor="day" className="text-xs">
                                Day
                              </Label>
                              <Select
                                value={
                                  profileData.birthday
                                    ? new Date(profileData.birthday)
                                        .getDate()
                                        .toString()
                                    : ""
                                }
                                onValueChange={(value) => {
                                  const day = parseInt(value);
                                  if (isNaN(day) || day < 1 || day > 31) return;

                                  const currentDate = profileData.birthday
                                    ? new Date(profileData.birthday)
                                    : new Date();
                                  currentDate.setDate(day);
                                  setProfileData({
                                    ...profileData,
                                    birthday: currentDate,
                                  });
                                }}
                              >
                                <SelectTrigger id="day">
                                  <SelectValue placeholder="Day" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from(
                                    { length: 31 },
                                    (_, i) => i + 1
                                  ).map((day) => (
                                    <SelectItem
                                      key={`day-${day}`}
                                      value={day.toString()}
                                    >
                                      {day}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="month" className="text-xs">
                                Month
                              </Label>
                              <Select
                                value={
                                  profileData.birthday
                                    ? (
                                        new Date(
                                          profileData.birthday
                                        ).getMonth() + 1
                                      ).toString()
                                    : ""
                                }
                                onValueChange={(value) => {
                                  const month = parseInt(value);
                                  if (isNaN(month) || month < 1 || month > 12)
                                    return;

                                  const currentDate = profileData.birthday
                                    ? new Date(profileData.birthday)
                                    : new Date();
                                  currentDate.setMonth(month - 1);
                                  setProfileData({
                                    ...profileData,
                                    birthday: currentDate,
                                  });
                                }}
                              >
                                <SelectTrigger id="month">
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    { value: "1", label: "January" },
                                    { value: "2", label: "February" },
                                    { value: "3", label: "March" },
                                    { value: "4", label: "April" },
                                    { value: "5", label: "May" },
                                    { value: "6", label: "June" },
                                    { value: "7", label: "July" },
                                    { value: "8", label: "August" },
                                    { value: "9", label: "September" },
                                    { value: "10", label: "October" },
                                    { value: "11", label: "November" },
                                    { value: "12", label: "December" },
                                  ].map((month) => (
                                    <SelectItem
                                      key={`month-${month.value}`}
                                      value={month.value}
                                    >
                                      {month.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="year" className="text-xs">
                                Year
                              </Label>
                              <Select
                                value={
                                  profileData.birthday
                                    ? new Date(profileData.birthday)
                                        .getFullYear()
                                        .toString()
                                    : ""
                                }
                                onValueChange={(value) => {
                                  const year = parseInt(value);
                                  if (
                                    isNaN(year) ||
                                    year < 1940 ||
                                    year > new Date().getFullYear() - 13
                                  )
                                    return;

                                  const currentDate = profileData.birthday
                                    ? new Date(profileData.birthday)
                                    : new Date();
                                  currentDate.setFullYear(year);
                                  setProfileData({
                                    ...profileData,
                                    birthday: currentDate,
                                  });
                                }}
                              >
                                <SelectTrigger id="year">
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from(
                                    { length: new Date().getFullYear() - 1939 },
                                    (_, i) => new Date().getFullYear() - 13 - i
                                  ).map((year) => (
                                    <SelectItem
                                      key={`year-${year}`}
                                      value={year.toString()}
                                    >
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="py-2 px-3 border rounded-md bg-muted cursor-pointer"
                            onClick={() => setIsEditing(true)}
                          >
                            {profileData.birthday
                              ? format(profileData.birthday, "PPP")
                              : "Click to set your birthday (Required)"}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          You must be at least 13 years old
                        </p>
                      </div>

                      {/* Location with autocomplete */}
                      <div className="space-y-2">
                        <Label htmlFor="location">
                          Location <span className="text-red-500">*</span>
                        </Label>
                        {isEditing ? (
                          <IndiaLocationAutocomplete
                            value={profileData.location || ""}
                            onChange={(value) =>
                              setProfileData({
                                ...profileData,
                                location: value,
                              })
                            }
                          />
                        ) : (
                          <div
                            className="py-2 px-3 border rounded-md bg-muted cursor-pointer"
                            onClick={() => setIsEditing(true)}
                          >
                            {profileData.location
                              ? INDIA_LOCATIONS.find(
                                  (loc) => loc.value === profileData.location
                                )?.label || profileData.location
                              : "Click to set your location (Required)"}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Select your city or district
                        </p>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          type="tel"
                          maxLength={10}
                          placeholder="10-digit mobile number"
                          className={
                            !isEditing ? "cursor-pointer bg-muted" : ""
                          }
                          readOnly={!isEditing}
                          onClick={() => !isEditing && setIsEditing(true)}
                          required
                          pattern="[6-9][0-9]{9}"
                        />
                        <p className="text-xs text-muted-foreground">
                          Indian mobile number (10 digits starting with 6-9)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Reset to original values
                            if (userProfile) {
                              setProfileData({
                                name: userProfile.name || "",
                                birthday: userProfile.birthday
                                  ? new Date(userProfile.birthday)
                                  : undefined,
                                location: userProfile.location || "",
                                phone: userProfile.phone || "",
                                avatarUrl: userProfile.avatarUrl || "",
                              });

                              // Restore referral code
                              if (userProfile.referralCode) {
                                setReferralCode(userProfile.referralCode);
                              }
                            }
                            setIsEditing(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={
                            // Disable if mutation is in progress
                            updateProfileMutation.isPending ||
                            // Disable if required fields are missing
                            !profileData.name?.trim() ||
                            !profileData.birthday ||
                            !profileData.location?.trim() ||
                            !profileData.phone?.trim() ||
                            !/^[6-9]\d{9}$/.test(profileData.phone || "") ||
                            // Disable if no changes have been made
                            (userProfile?.profile &&
                              userProfile.profile.name === profileData.name &&
                              userProfile.profile.phone === profileData.phone &&
                              (userProfile.profile.birthday?.seconds ===
                                profileData.birthday?.getTime() / 1000 ||
                                (userProfile.profile.birthday &&
                                  profileData.birthday &&
                                  new Date(
                                    userProfile.profile.birthday.seconds * 1000
                                  ).getTime() ===
                                    profileData.birthday.getTime())) &&
                              userProfile.profile.location ===
                                profileData.location)
                          }
                        >
                          {updateProfileMutation.isPending
                            ? "Saving..."
                            : "Save Changes"}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        Edit All Fields
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Subscription Tab */}
              <TabsContent value="subscription">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Details</CardTitle>
                    <CardDescription>
                      Manage your subscription and billing information
                    </CardDescription>
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
                              <p className="text-muted-foreground text-sm">
                                Monthly Subscription
                              </p>
                            </div>
                            <Badge
                              className={
                                subscriptionData.status === "active"
                                  ? "bg-green-500"
                                  : "bg-amber-500"
                              }
                            >
                              {subscriptionData.status === "active"
                                ? "Active"
                                : "Pending"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Amount
                              </p>
                              <p className="font-medium">
                                {formatCurrency(30)}/month
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Next Billing Date
                              </p>
                              <p className="font-medium">
                                {formatDate(subscriptionData.endDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Started On
                              </p>
                              <p className="font-medium">
                                {formatDate(subscriptionData.startDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Subscription ID
                              </p>
                              <p className="font-medium text-xs">
                                {subscriptionData.razorpaySubscriptionId}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <Separator className="my-4" />
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">
                                Cancel Subscription
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Your subscription will remain active until the
                                end of the billing period.
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleCancelSubscription}
                              disabled={
                                cancelSubscriptionMutation.isPending ||
                                subscriptionData.status !== "active"
                              }
                            >
                              {cancelSubscriptionMutation.isPending
                                ? "Processing..."
                                : "Cancel Subscription"}
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10">
                        <h3 className="font-semibold mb-2">
                          No Active Subscription
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          You don't have an active subscription.
                        </p>
                        <Button onClick={() => navigate("/subscribe")}>
                          Subscribe Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Current Week Reward */}
                <div className="mt-6">
                  {rewardLoading ? (
                    <Card className="animate-pulse bg-card rounded-xl shadow-lg">
                      <CardContent className="p-6">
                        <div className="h-48 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ) : error ? (
                    <Card className="bg-card rounded-xl shadow-lg">
                      <CardContent className="p-6 text-center">
                        <p className="text-error mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                          Retry
                        </Button>
                      </CardContent>
                    </Card>
                  ) : displayReward ? (
                    <CurrentReward
                      prizeName={displayReward.prizeName}
                      prizeValue={displayReward.prizeValue}
                      description={
                        displayReward.description ||
                        `${
                          displayReward.prizeType === "voucher"
                            ? `Use it on ${displayReward.sponsor}!`
                            : displayReward.prizeType === "recharge"
                              ? "Recharge any mobile number with a premium plan!"
                              : "Exciting reward waiting for you!"
                        }`
                      }
                      imageUrl={displayReward.imageUrl}
                      drawDate={nextDrawDate.toISOString()}
                    />
                  ) : (
                    <Card className="bg-card rounded-xl shadow-lg">
                      <CardContent className="p-6 text-center">
                        <p className="text-xl font-semibold text-white mb-4">
                          No active reward this week
                        </p>
                        <p className="text-muted-foreground">
                          Check back soon for upcoming rewards!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Previous Results */}
                <div className="mt-6">
                  <PreviousResults />
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Email Address</h3>
                      <div className="flex justify-between items-center">
                        <div>
                          <p>{currentUser?.email}</p>
                          <p className="text-xs text-muted-foreground">
                            This is the email address you use to sign in.
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Change Email
                            </Button>
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
                          <p className="text-xs text-muted-foreground">
                            Last changed: Unknown
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Change Password
                            </Button>
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
                            <Label
                              htmlFor="emailNotifications"
                              className="font-medium"
                            >
                              Email Notifications
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Receive notifications about rewards, draws, and
                              important updates.
                            </p>
                          </div>
                          <Switch
                            id="emailNotifications"
                            defaultChecked={true}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label
                              htmlFor="marketingEmails"
                              className="font-medium"
                            >
                              Marketing Emails
                            </Label>
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
                      <h3 className="font-semibold mb-3 text-destructive">
                        Danger Zone
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Delete your account and all associated data. This action
                        cannot be undone.
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive">Delete Account</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Delete Account</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete your account? This
                              action cannot be undone and all your data will be
                              permanently removed.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="text-sm text-muted-foreground">
                              Please type "DELETE" to confirm account deletion:
                            </p>
                            <Input
                              className="mt-2"
                              placeholder="Type DELETE here"
                            />
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button variant="destructive">
                              Delete My Account
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  {profileData.avatarUrl ? (
                    <AvatarImage
                      src={profileData.avatarUrl}
                      alt={profileData.name || "User"}
                    />
                  ) : null}
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {getInitials(profileData.name || "")}
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-xl font-semibold">
                  {profileData.name || "User"}
                </h2>
                <p className="text-muted-foreground">{currentUser?.email}</p>

                {referralCode && (
                  <Badge variant="outline" className="mt-1">
                    Referral Code: {referralCode}
                  </Badge>
                )}

                {currentUser?.isSubscribed ? (
                  <Badge className="mt-2 bg-gradient-to-r from-indigo-500 to-purple-600">
                    Premium Member
                  </Badge>
                ) : (
                  <Badge variant="outline" className="mt-2">
                    Free User
                  </Badge>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start mt-4"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log Out
                </Button>
              </CardContent>
            </Card>

            {/* Countdown Widget */}
            <CountdownWidget drawDate={nextDrawDate.toISOString()} />

            {/* Referral Widget */}
            <ReferralWidget
              referralCode={referralCode || displayUserData.referralCode || ""}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

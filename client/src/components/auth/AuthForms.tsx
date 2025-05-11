import { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { register as registerUser, login as loginUser, resetPassword } from '@/firebase';
import { Eye, EyeOff } from 'lucide-react';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// Register form schema
const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  referralCode: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthFormsProps {
  activeTab?: 'login' | 'register';
  referralCode?: string;
}

const AuthForms = ({ activeTab = 'login', referralCode }: AuthFormsProps) => {
  const [tabValue, setTabValue] = useState<string>(activeTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
      referralCode: referralCode || '',
    },
  });

  const handleLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Attempting to login with:", data.email);
      await loginUser(data.email, data.password);
      toast({
        title: "Login successful",
        description: "Welcome back to Chillar Club!",
        duration: 3000,
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Failed to login. Please try again.";
      let errorDetails = "";
      
      // Handle known Firebase auth error codes
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid credentials. Please check your email and password.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format. Please enter a valid email address.";
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Authentication service is unavailable.";
        errorDetails = "Please try again later or contact support.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network connection error.";
        errorDetails = "Please check your internet connection and try again.";
      } else if (error.code === 'auth/internal-error') {
        errorMessage = "An internal error occurred.";
        errorDetails = "Please try again later or contact support.";
      } else if (error.message) {
        // If we have any error message, display it
        errorDetails = error.message;
      }
      
      toast({
        title: "Login failed",
        description: errorDetails ? `${errorMessage} ${errorDetails}` : errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Attempting to register with email:", data.email);
      await registerUser(data.email, data.password, data.referralCode);
      toast({
        title: "Registration successful",
        description: "Welcome to Chillar Club! You are now logged in.",
        duration: 3000,
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Failed to register. Please try again.";
      let errorDetails = "";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists.";
        errorDetails = "Please try logging in instead.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format. Please enter a valid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak.";
        errorDetails = "Please use a stronger password with at least 6 characters.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Registration is temporarily disabled.";
        errorDetails = "Please try again later or contact support.";
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Authentication service is unavailable.";
        errorDetails = "Please try again later or contact support.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network connection error.";
        errorDetails = "Please check your internet connection and try again.";
      } else if (error.code === 'auth/internal-error') {
        errorMessage = "An internal error occurred.";
        errorDetails = "Please try again later or contact support.";
      } else if (error.message) {
        errorDetails = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorDetails ? `${errorMessage} ${errorDetails}` : errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = loginForm.getValues('email');
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setResetEmail(email);
    setIsResettingPassword(true);
    
    try {
      console.log("Attempting to send password reset email to:", email);
      await resetPassword(email);
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for further instructions",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      let errorMessage = "Failed to send password reset email. Please try again.";
      let errorDetails = "";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
        errorDetails = "Please check your email or register a new account.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
        errorDetails = "Please enter a valid email address.";
      } else if (error.code === 'auth/missing-android-pkg-name') {
        errorMessage = "Reset service configuration issue.";
        errorDetails = "Please contact support.";
      } else if (error.code === 'auth/missing-continue-uri') {
        errorMessage = "Reset service configuration issue.";
        errorDetails = "Please contact support.";
      } else if (error.code === 'auth/missing-ios-bundle-id') {
        errorMessage = "Reset service configuration issue.";
        errorDetails = "Please contact support.";
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Authentication service is unavailable.";
        errorDetails = "Please try again later or contact support.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network connection error.";
        errorDetails = "Please check your internet connection and try again.";
      } else if (error.message) {
        errorDetails = error.message;
      }
      
      toast({
        title: "Password reset failed",
        description: errorDetails ? `${errorMessage} ${errorDetails}` : errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Card className="bg-card rounded-xl shadow-xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold gradient-text">Welcome to Chillar Club</h2>
              <p className="mt-2 text-muted-foreground">Login or register to access your rewards</p>
            </div>
            
            <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="you@example.com" 
                              type="email" 
                              {...field}
                              className="bg-muted border-border text-white focus:border-primary" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            <Button 
                              type="button" 
                              variant="link" 
                              className="text-secondary hover:text-secondary-light p-0 h-auto text-sm"
                              onClick={handleForgotPassword}
                              disabled={isResettingPassword}
                            >
                              {isResettingPassword ? "Sending..." : "Forgot password?"}
                            </Button>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="••••••••" 
                                type={showLoginPassword ? "text" : "password"} 
                                {...field}
                                className="bg-muted border-border text-white focus:border-primary pr-10" 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-white"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                tabIndex={-1}
                              >
                                {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                <span className="sr-only">
                                  {showLoginPassword ? "Hide password" : "Show password"}
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full gradient-bg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="you@example.com" 
                              type="email" 
                              {...field}
                              className="bg-muted border-border text-white focus:border-primary" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="••••••••" 
                                type={showRegisterPassword ? "text" : "password"} 
                                {...field}
                                className="bg-muted border-border text-white focus:border-primary pr-10" 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-white"
                                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                tabIndex={-1}
                              >
                                {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                <span className="sr-only">
                                  {showRegisterPassword ? "Hide password" : "Show password"}
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="••••••••" 
                                type={showConfirmPassword ? "text" : "password"} 
                                {...field}
                                className="bg-muted border-border text-white focus:border-primary pr-10" 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-white"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex={-1}
                              >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                <span className="sr-only">
                                  {showConfirmPassword ? "Hide password" : "Show password"}
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="referralCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referral Code (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter referral code" 
                              {...field}
                              className="bg-muted border-border text-white focus:border-primary" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-primary data-[state=checked]:text-black"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-muted-foreground">
                              I agree to the <a href="/terms" className="text-secondary hover:text-secondary-light">Terms of Service</a> and <a href="/privacy" className="text-secondary hover:text-secondary-light">Privacy Policy</a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full gradient-bg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Registering..." : "Register"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthForms;
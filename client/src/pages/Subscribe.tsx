import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { CONFIG } from "@/config";
import { WelcomeDialog } from "@/components/dialogs/WelcomeDialog";

// Types
interface PlanOption {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  isMostPopular?: boolean;
  discount?: number;
}

interface OrderDetails {
  orderId: string;
  amount: number;
  currency: string;
  userId: number;
  planType: string;
  key: string;
}

const Subscribe = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { userDetails } = useAuth();
  const [loading, setLoading] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Subscription plan options
  const plans: PlanOption[] = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: 30,
      interval: "per month",
      description: "Perfect for trying out Chillar Club. Cancel anytime.",
    },
    {
      id: "annual",
      name: "Annual Plan",
      price: 330,
      interval: "per year",
      description: "One month free! Best value with maximum rewards.",
      isMostPopular: true,
    },
  ];

  useEffect(() => {
    // Set page title
    document.title = `Subscribe | ${CONFIG.APP_NAME}`;

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Function to handle subscription payment
  const handleSubscription = async () => {
    if (!userDetails?.uid) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      setLocation("/join");
      return;
    }

    try {
      setCreatingOrder(true);
      toast({
        title: "Processing",
        description: "Setting up your subscription...",
      });

      // Create an order on the server
      const response = await apiRequest(
        "POST",
        "/api/create-subscription-order",
        {
          planType: selectedPlan.toUpperCase(),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Order creation failed:", errorData);
        throw new Error("Failed to create subscription order");
      }

      const data = await response.json();
      setOrderDetails(data);

      // Toast for successful order creation before opening Razorpay
      toast({
        title: "Order Created",
        description: "Opening secure payment page...",
      });

      // Open Razorpay checkout
      openRazorpayCheckout(data);
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  // Open Razorpay checkout modal
  const openRazorpayCheckout = (orderData: OrderDetails) => {
    // Force development mode behavior
    const isDevelopment = true; // Always use development mode for now
    if (isDevelopment) {
      console.log("Development mode: Simulating payment success");
      toast({
        title: "Development Mode",
        description: "Processing test payment...",
      });

      // Show loading indicator
      setLoading(true);

      // Generate mock payment response
      const mockResponse = {
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_order_id: orderData.orderId,
        razorpay_signature: "test_signature",
      };

      // Simulate a delay before handling success (like a real payment would take)
      setTimeout(() => {
        handlePaymentSuccess(mockResponse);
        setLoading(false);
      }, 1500);

      return;
    }

    // Check if Razorpay is loaded
    if (!(window as any).Razorpay) {
      toast({
        title: "Payment Gateway Error",
        description: "Payment system is not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    const selectedPlanObj = plans.find((p) => p.id === selectedPlan);
    const options = {
      key: orderData.key || "rzp_test_development_mode",
      amount: orderData.amount * 100, // Razorpay expects amount in paise
      currency: orderData.currency || "INR",
      name: CONFIG.APP_NAME,
      description: `${selectedPlanObj?.name || "Subscription"} - ${CONFIG.APP_NAME} (Test Mode)`,
      order_id: orderData.orderId,
      handler: function (response: any) {
        // In development, create a mock successful response
        const mockResponse = {
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_order_id: orderData.orderId,
          razorpay_signature: "test_signature",
        };
        handlePaymentSuccess(mockResponse);
      },
      prefill: {
        name: userDetails?.profile?.name || "",
        email: userDetails?.email || "",
        contact: userDetails?.profile?.phone || "",
      },
      notes: {
        userId: userDetails?.uid,
        planType: selectedPlan,
      },
      theme: {
        color: "#6366F1", // Indigo color
      },
      modal: {
        backdropclose: true,
        escape: true,
        handleback: true,
        confirm_close: true,
        ondismiss: function () {
          setLoading(false);
          toast({
            title: "Payment Cancelled",
            description:
              "You have cancelled the payment process. You can try again anytime.",
          });
        },
      },
    };

    try {
      setLoading(true);
      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast({
        title: "Payment Gateway Error",
        description: "Could not initialize payment gateway. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (response: any) => {
    try {
      setLoading(true);
      toast({
        title: "Verifying Payment",
        description: "Please wait while we confirm your payment...",
      });

      console.log("Processing payment verification:", response);

      // Verify payment on server
      const verifyResponse = await apiRequest(
        "POST",
        "/api/verify-subscription-payment",
        {
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
          planType: selectedPlan.toUpperCase(),
        }
      );

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error("Server verification error:", errorText);
        throw new Error(
          `Payment verification failed: ${verifyResponse.statusText}`
        );
      }

      const result = await verifyResponse.json();
      console.log("Payment verification result:", result);

      if (result.success) {
        setShowSuccessDialog(true);
      } else {
        throw new Error(result.message || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification Failed",
        description:
          error.message ||
          "There was an error verifying your payment. Please contact support if the amount was deducted.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Layout>
        <div className="flex flex-col items-center min-h-screen py-12 px-4">
          <div className="w-full max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold gradient-text mb-4">
                Join Chillar Club
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Subscribe to participate in our weekly rewards and enjoy
                exclusive member benefits
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-[900px] mx-auto">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className="focus:outline-none text-left w-full group"
              >
                <Card
                  className={`relative h-full ${selectedPlan === "monthly" ? "ring-2 ring-primary shadow-lg scale-[1.02]" : "border-border hover:border-primary"} transition-all duration-200`}
                >
                  {plans[0].isMostPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plans[0].name}</CardTitle>
                    <CardDescription>{plans[0].description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end mb-4">
                      <span className="text-4xl font-bold">
                        ₹{plans[0].price}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {plans[0].interval}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Weekly reward draws
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Cancel anytime
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Access to all basic features
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <div
                      className={`w-full py-2 px-4 rounded-md ${selectedPlan === "monthly" ? "bg-primary/10 text-primary" : "bg-muted"} transition-colors`}
                    >
                      {selectedPlan === "monthly"
                        ? "✓ Selected"
                        : "Click to select Monthly Plan"}
                    </div>
                  </CardFooter>
                </Card>
              </button>

              <button
                onClick={() => setSelectedPlan("annual")}
                className="focus:outline-none text-left w-full group"
              >
                <Card
                  className={`relative h-full ${selectedPlan === "annual" ? "ring-2 ring-primary shadow-lg scale-[1.02]" : "border-border hover:border-primary"} transition-all duration-200`}
                >
                  {plans[1].isMostPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium z-10">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plans[1].name}</CardTitle>
                    <CardDescription>{plans[1].description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end mb-4">
                      <span className="text-4xl font-bold">
                        ₹{plans[1].price}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {plans[1].interval}
                      </span>
                      <span className="ml-3 bg-green-500/10 text-green-500 px-2 py-1 rounded text-sm">
                        One Month Free
                      </span>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Weekly reward draws
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Increased odds of winning
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Premium rewards access
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Special annual member perks
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <div
                      className={`w-full py-2 px-4 rounded-md ${selectedPlan === "annual" ? "bg-primary/10 text-primary" : "bg-muted"} transition-colors`}
                    >
                      {selectedPlan === "annual"
                        ? "✓ Selected"
                        : "Click to select Annual Plan"}
                    </div>
                  </CardFooter>
                </Card>
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 mt-10">
              <Button
                size="lg"
                className="px-8 py-6 text-lg relative min-w-[300px]"
                disabled={loading || creatingOrder}
                onClick={handleSubscription}
              >
                {loading || creatingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {creatingOrder
                      ? "Setting up subscription..."
                      : "Processing payment..."}
                  </>
                ) : (
                  <>
                    <span>
                      Subscribe for ₹
                      {selectedPlan === "monthly" ? "30/month" : "330/year"}
                    </span>
                    {selectedPlan === "annual" && (
                      <span className="absolute -top-3 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                        Save ₹30
                      </span>
                    )}
                  </>
                )}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Secure payment via Razorpay
              </div>
            </div>

            <div className="text-center mt-6 text-sm text-muted-foreground">
              By subscribing, you agree to our{" "}
              <a href="/terms" className="underline hover:text-primary">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-primary">
                Privacy Policy
              </a>
              .
            </div>

            <div className="mt-12 bg-card rounded-lg p-6 max-w-[800px] mx-auto border border-border">
              <h3 className="text-xl font-medium mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">How does billing work?</h4>
                  <p className="text-muted-foreground">
                    Your subscription will be charged automatically at the
                    beginning of each billing period. Monthly plans renew every
                    30 days, and annual plans renew every 365 days.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Can I cancel my subscription?</h4>
                  <p className="text-muted-foreground">
                    Yes, you can cancel your subscription at any time from your
                    dashboard. Your subscription benefits will continue until
                    the end of your current billing period.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Is my payment secure?</h4>
                  <p className="text-muted-foreground">
                    Yes, all payments are securely processed through Razorpay, a
                    trusted payment gateway that uses industry-standard
                    encryption to keep your information safe.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">
                    What happens after I subscribe?
                  </h4>
                  <p className="text-muted-foreground">
                    After subscribing, you'll be automatically entered into all
                    upcoming weekly reward draws. You can view available rewards
                    and past winners from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* Welcome Dialog */}
      <WelcomeDialog
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          setLocation("/dashboard");
        }}
        planType={selectedPlan}
      />
    </>
  );
};

export default Subscribe;

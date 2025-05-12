import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

interface WelcomeDialogProps {
  open: boolean;
  onClose: () => void;
  planType: "monthly" | "annual";
}

export function WelcomeDialog({ open, onClose, planType }: WelcomeDialogProps) {
  useEffect(() => {
    if (open) {
      // Fire confetti from multiple angles
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 10000,
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Use both top corners and middle
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.1, 0.3) },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.1, 0.3) },
        });
      }, 250);

      return () => {
        clearInterval(interval);
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-center text-xl">
            Welcome to Chillar Club! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            {planType === "monthly"
              ? "You've successfully subscribed to our Monthly Plan."
              : "You've successfully subscribed to our Annual Plan and saved big!"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-center">
          <p>
            Get ready to participate in exciting weekly reward draws and unlock
            exclusive benefits!
          </p>
          <p className="text-muted-foreground text-sm">
            Check your subscription status and browse available rewards in your
            dashboard.
          </p>
        </div>
        <DialogFooter className="flex justify-center">
          <Button onClick={onClose} className="w-32">
            Let's Go!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

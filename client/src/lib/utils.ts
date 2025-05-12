import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (
  amount: number,
  currency: string = "INR"
): string => {
  const currencySymbol =
    currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;
  return `${currencySymbol}${amount.toFixed(2)}`;
};

export const formatDate = (
  date: Date | string | null | undefined,
  format: "short" | "long" | "relative" = "short"
): string => {
  if (!date) {
    return "Not set";
  }

  try {
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      // Handle ISO strings and other date formats
      if (date.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        // ISO string - use it directly
        dateObj = new Date(date);
      } else {
        // Try parsing other date formats with explicit timezone
        const parsed = new Date(date + "Z");
        if (!isNaN(parsed.getTime())) {
          dateObj = parsed;
        } else {
          // Fallback to direct parsing
          dateObj = new Date(date);
        }
      }
    } else {
      return "Invalid date";
    }

    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    // Convert to local timezone
    dateObj = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000);

    if (format === "relative") {
      return getRelativeTimeString(dateObj);
    }

    const dateFormat: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: format === "long" ? "long" : "short",
      day: "numeric",
      ...(format === "long"
        ? {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        : {}),
    };

    return new Intl.DateTimeFormat("en-IN", dateFormat).format(dateObj);
  } catch (error) {
    console.error("Date formatting error:", error, "for input:", date);
    return "Error formatting date";
  }
};

// Helper function to display relative time
const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const isInFuture = diffTime > 0;
  const diffDays = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);

  // For future dates
  if (isInFuture) {
    if (diffDays === 0) {
      return "Later today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays < 7) {
      return `In ${diffDays} days`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `In ${weeks} week${weeks > 1 ? "s" : ""}`;
    } else if (diffMonths < 12) {
      return `In ${diffMonths} month${diffMonths > 1 ? "s" : ""}`;
    }
  }
  // For past dates
  else {
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    }
  }

  // For dates more than a year away or old
  return formatDate(date, "short");
};

export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  return `${localPart.charAt(0)}****@${domain}`;
};

export const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return Math.ceil((day + start.getDay()) / 7);
};

export const getCurrentWeekString = (): string => {
  const currentWeek = getCurrentWeekNumber();
  const currentYear = new Date().getFullYear();
  return `${currentYear}-${currentWeek < 10 ? "0" + currentWeek : currentWeek}`;
};

export const getWeekDateRange = (
  weekStr: string
): { start: Date; end: Date } => {
  const [year, week] = weekStr.split("-").map(Number);

  // Find the first day of the year
  const firstDayOfYear = new Date(year, 0, 1);

  // Find the first day of the first week
  const firstDayOfFirstWeek = new Date(firstDayOfYear);
  const dayOfWeek = firstDayOfYear.getDay();
  const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  firstDayOfFirstWeek.setDate(firstDayOfYear.getDate() + daysToAdd);

  // Find the first day of the specified week
  const firstDayOfWeek = new Date(firstDayOfFirstWeek);
  firstDayOfWeek.setDate(firstDayOfFirstWeek.getDate() + (week - 1) * 7);

  // Find the last day of the specified week
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

  return { start: firstDayOfWeek, end: lastDayOfWeek };
};

export const formatWeekDateRange = (weekStr: string): string => {
  const { start, end } = getWeekDateRange(weekStr);
  const startStr = formatDate(start);
  const endStr = formatDate(end);
  return `${startStr} - ${endStr}`;
};

export const generateGradientColorClass = (index: number): string => {
  const gradients = [
    "from-primary to-secondary",
    "from-secondary to-accent",
    "from-accent to-primary",
  ];
  return gradients[index % gradients.length];
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// For handling API requests
export const handleApiError = (error: any): string => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || "An unexpected error occurred";
};

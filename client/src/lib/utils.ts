import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
  return `${currencySymbol}${amount.toFixed(2)}`;
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Format manually to ensure consistent display across browsers
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[dateObj.getMonth()];
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  return `${month} ${day}, ${year}`;
};

export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
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
  return `${currentYear}-${currentWeek < 10 ? '0' + currentWeek : currentWeek}`;
};

export const getWeekDateRange = (weekStr: string): { start: Date; end: Date } => {
  const [year, week] = weekStr.split('-').map(Number);
  
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
    'from-primary to-secondary',
    'from-secondary to-accent',
    'from-accent to-primary',
  ];
  return gradients[index % gradients.length];
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// For handling API requests
export const handleApiError = (error: any): string => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || 'An unexpected error occurred';
};

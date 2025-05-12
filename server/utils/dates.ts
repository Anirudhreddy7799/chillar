import { addMonths } from "date-fns";

/**
 * Calculate the end date for a subscription based on the plan type and start date.
 * Handles edge cases like month length differences properly.
 *
 * @param startDate - The start date of the subscription
 * @param isPlanAnnual - Whether this is an annual plan
 * @returns The calculated end date
 */
export function calculateSubscriptionEndDate(
  startDate: Date,
  isPlanAnnual: boolean
): Date {
  const endDate = new Date(startDate);

  if (isPlanAnnual) {
    // For annual plans, add exactly one year
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    // For monthly plans, preserve the day of month while handling edge cases
    const originalDay = endDate.getDate();
    endDate.setMonth(endDate.getMonth() + 1);

    // Handle edge cases like Jan 31 -> Feb 28/29
    if (endDate.getDate() !== originalDay) {
      // Set to last day of target month if original day doesn't exist
      endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    }
  }

  return endDate;
}

import * as React from "react";
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  href: string;
  label: string;
  current?: boolean;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[];
  showHome?: boolean;
  [key: string]: any; // Allow for additional custom props
}

export function Breadcrumb({
  items,
  showHome = true,
  className,
  ...props
}: BreadcrumbProps) {
  // Use a type-safe approach to extract any custom attributes
  const safeProps = { ...props };
  
  return (
    <nav
      className={cn("flex items-center text-sm", className)}
      aria-label="Breadcrumb"
      {...safeProps}
    >
      <ol className="flex items-center space-x-2">
        {showHome && (
          <li>
            <Link href="/">
              <span className="flex items-center text-muted-foreground hover:text-white transition-colors">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </span>
            </Link>
          </li>
        )}
        
        {showHome && items.length > 0 && (
          <li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </li>
        )}
        
        {items.map((item, index) => {
          // Use array instead of React.Fragment to avoid props being passed to Fragment
          return [
            <li key={`item-${item.href}`}>
              <Link href={item.href}>
                <span
                  className={cn(
                    "text-sm font-medium hover:text-white transition-colors",
                    item.current ? "text-white" : "text-muted-foreground"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.label}
                </span>
              </Link>
            </li>,
            index < items.length - 1 && (
              <li key={`separator-${index}`}>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </li>
            )
          ];
        }).flat().filter(Boolean)}
      </ol>
    </nav>
  );
}
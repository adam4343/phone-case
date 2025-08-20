import { cva } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer duration-200 ease-in whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-primary bg-background hover:bg-accent hover:text-accent-foreground",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent/90 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        card: "bg-card text-card-foreground hover:bg-card/90 border border-border",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md text-xs px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
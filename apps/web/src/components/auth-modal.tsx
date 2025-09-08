import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { User, UserPlus, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader className="text-center space-y-4">
          <DialogTitle className="text-2xl font-semibold text-foreground">
            Hey there! 👋
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base leading-relaxed">
            To continue with your order, you'll need to sign in to your account
            or create a new one. It only takes a moment!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Link
            href={"/login"}
            className={`${buttonVariants({
              variant: "default",
            })} w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors`}
          >
            <User className="w-4 h-4 mr-2" />
            Sign In
          </Link>

          <Link
            href={"/register"}
            className={`${buttonVariants({
              variant: "outline",
            })} w-full h-11  border-border hover:bg-accent hover:text-accent-foreground font-medium transition-colors`}
          >
            <UserPlus className="w-4 h-4 mr-2 " />
            Create Account
          </Link>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Your order will be saved and you can continue right where you left
            off
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

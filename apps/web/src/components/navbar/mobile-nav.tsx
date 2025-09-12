'use client'

import {
  ArrowRight,
  Menu,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { TUser } from "@/lib/types/user";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/lib/utils";

type Props = {
  user?: TUser;
};

export default function MobileNavigation({ user }: Props) {
  const router = useRouter();

  return (
    <div className="md:hidden flex items-center space-x-2">
      <Link
        href="/configure/upload"
        className={buttonVariants({
          size: "sm",
          className: "flex items-center gap-1 group",
        })}
      >
        Create case
        <ArrowRight className="ml-1 h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>

      {/* Menu Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="p-2">
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 z-[999]">
          {user ? (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => router.push("/"),
                    },
                  });
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href="/login"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/register"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign up
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

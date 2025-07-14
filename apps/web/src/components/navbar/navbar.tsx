'use client'
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";

import MobileNavigation from "./mobile-nav";
import Container from "../shared/container";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
   const router = useRouter();
   const { data: session, isPending } = authClient.useSession();

  return (
    <nav className="sticky z-[100] h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <Container>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            case<span className="text-primary">cobra</span>
          </Link>

          <div className="hidden md:flex h-full items-center space-x-4">
            {session?.user ? (
              <>
                <Button
                disabled={isPending}
                onClick={() => {
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.push("/");
                      },
                    },
                  });
                }}
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Sign out
                </Button>
                <Link
                  href="/configure/upload"
                  className={buttonVariants({
                    size: "sm",
                    className: "flex items-center gap-1",
                  })}
                >
                  Create case
                  <ArrowRight className="ml-1.5 h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Login
                </Link>
                <div className="h-8 w-px bg-zinc-200" />
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
              </>
            )}
          </div>

          <MobileNavigation user={session?.user} />
        </div>
      </Container>
    </nav>
  );
};


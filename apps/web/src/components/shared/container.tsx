import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children: React.ReactNode;
};
export default function Container({ className, children }: Props) {
  return (
    <div
      className={cn(
        "h-full mx-auto w-full max-w-screen-xl px-2.5 md:px-20",
        className
      )}
    >
      {children}
    </div>
  );
}

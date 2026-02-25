import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
}

const sizeClasses = {
  sm: {
    container: "h-8",
    text: "text-lg",
    tagline: "text-[10px]",
  },
  md: {
    container: "h-10",
    text: "text-xl",
    tagline: "text-xs",
  },
  lg: {
    container: "h-14",
    text: "text-3xl",
    tagline: "text-sm",
  },
};

export function Logo({ size = "md", className, showTagline = false }: LogoProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-2", sizes.container, className)}>
      {/* Logo Icon - Soap bubble inspired */}
      <div className="relative">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "w-auto",
            size === "sm" && "h-7",
            size === "md" && "h-9",
            size === "lg" && "h-12"
          )}
        >
          {/* Main bubble */}
          <defs>
            <linearGradient id="bubbleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="bubbleShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Main circle */}
          <circle cx="20" cy="20" r="18" fill="url(#bubbleGradient)" />

          {/* Shine effect */}
          <ellipse cx="14" cy="14" rx="6" ry="4" fill="url(#bubbleShine)" transform="rotate(-30 14 14)" />

          {/* Small decorative bubbles */}
          <circle cx="32" cy="10" r="4" fill="url(#bubbleGradient)" opacity="0.6" />
          <circle cx="8" cy="32" r="3" fill="url(#bubbleGradient)" opacity="0.4" />

          {/* Inner "S" shape suggestion */}
          <path
            d="M16 15 C16 13, 18 12, 20 12 C23 12, 24 14, 24 15.5 C24 17, 22 18, 20 18 C18 18, 16 19, 16 21 C16 23, 18 24, 20 24 C22 24, 24 23, 24 21"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Logo Text */}
      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 bg-clip-text text-transparent",
            sizes.text
          )}
        >
          SoapBox
        </span>
        {showTagline && (
          <span className={cn("text-muted-foreground -mt-0.5", sizes.tagline)}>
            Super App
          </span>
        )}
      </div>
    </div>
  );
}

export function LogoIcon({ size = "md", className }: Omit<LogoProps, "showTagline">) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "w-auto",
        size === "sm" && "h-6",
        size === "md" && "h-8",
        size === "lg" && "h-10",
        className
      )}
    >
      <defs>
        <linearGradient id="bubbleGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="bubbleShineIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="20" cy="20" r="18" fill="url(#bubbleGradientIcon)" />
      <ellipse cx="14" cy="14" rx="6" ry="4" fill="url(#bubbleShineIcon)" transform="rotate(-30 14 14)" />
      <circle cx="32" cy="10" r="4" fill="url(#bubbleGradientIcon)" opacity="0.6" />
      <circle cx="8" cy="32" r="3" fill="url(#bubbleGradientIcon)" opacity="0.4" />
      <path
        d="M16 15 C16 13, 18 12, 20 12 C23 12, 24 14, 24 15.5 C24 17, 22 18, 20 18 C18 18, 16 19, 16 21 C16 23, 18 24, 20 24 C22 24, 24 23, 24 21"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
}

export default Logo;

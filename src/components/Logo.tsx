import { cn } from "@/lib/utils";
import soapboxLogo from "@/assets/soapbox-logo-new.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
}

const sizeClasses = {
  sm: {
    container: "h-8",
    image: "h-8 w-8",
    text: "text-base",
    tagline: "text-[10px]",
  },
  md: {
    container: "h-10",
    image: "h-10 w-10",
    text: "text-lg",
    tagline: "text-xs",
  },
  lg: {
    container: "h-14",
    image: "h-14 w-14",
    text: "text-2xl",
    tagline: "text-sm",
  },
};

export function Logo({ size = "md", className, showTagline = false }: LogoProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-3", sizes.container, className)}>
      {/* Logo Image */}
      <img
        src={soapboxLogo}
        alt="SoapBox Logo"
        className={cn(sizes.image, "object-contain")}
      />

      {/* Logo Text */}
      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold tracking-tight text-white",
            sizes.text
          )}
        >
          SoapBox
        </span>
        {showTagline && (
          <span className={cn("text-slate-400 -mt-0.5 font-medium tracking-wide", sizes.tagline)}>
            Church Management
          </span>
        )}
      </div>
    </div>
  );
}

export function LogoIcon({ size = "md", className }: Omit<LogoProps, "showTagline">) {
  const sizes = sizeClasses[size];

  return (
    <img
      src={soapboxLogo}
      alt="SoapBox Logo"
      className={cn(sizes.image, "object-contain", className)}
    />
  );
}

export default Logo;

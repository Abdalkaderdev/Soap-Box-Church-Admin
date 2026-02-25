import { cn } from "@/lib/utils";
import soapboxLogo from "@/assets/soapbox-logo-new.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: {
    container: "h-10",
    image: "h-9 w-9",
    text: "text-base",
    tagline: "text-[10px]",
  },
  md: {
    container: "h-12",
    image: "h-11 w-11",
    text: "text-lg",
    tagline: "text-xs",
  },
  lg: {
    container: "h-16",
    image: "h-14 w-14",
    text: "text-2xl",
    tagline: "text-sm",
  },
};

export function Logo({ size = "md", className }: LogoProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-3", sizes.container, className)}>
      {/* Logo Image */}
      <img
        src={soapboxLogo}
        alt="SoapBox Logo"
        className={cn(sizes.image, "object-contain flex-shrink-0")}
      />

      {/* Logo Text */}
      <div className="flex flex-col leading-tight">
        <span className={cn("font-serif font-bold tracking-tight text-ivory-100", sizes.text)}>
          SoapBox
        </span>
        <span className={cn("font-medium text-sidebar-primary tracking-wide", sizes.tagline)}>
          Church Management
        </span>
      </div>
    </div>
  );
}

export function LogoIcon({ size = "md", className }: LogoProps) {
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

import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:outline-slate-500",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
};

const Button = ({
  as: Component = "button",
  children,
  className = "",
  disabled = false,
  isLoading = false,
  tabIndex,
  type = "button",
  variant = "primary",
  ...props
}) => {
  const isButton = Component === "button";
  const isDisabled = disabled || isLoading;
  const buttonProps = isButton
    ? {
        type,
        disabled: isDisabled,
      }
    : {
        "aria-disabled": isDisabled,
        tabIndex: isDisabled ? -1 : tabIndex,
      };

  return (
    <Component
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${isDisabled && !isButton ? "pointer-events-none cursor-not-allowed opacity-60" : ""} ${variants[variant]} ${className}`}
    {...buttonProps}
    {...props}
  >
    {isLoading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
    {children}
    </Component>
  );
};

export default Button;

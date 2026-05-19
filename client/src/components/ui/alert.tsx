import * as React from "react";
import { cn } from "../../lib/utils";
import { Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "brand" | "neutral" | "error" | "success" | "warning";
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { variant = "neutral", icon, title, description, className, ...props },
    ref,
  ) => {
    // Auto-seleccionamos el icono dependiendo del error/éxito si no nos pasan uno
    const DefaultIcon =
      variant === "error"
        ? AlertCircle
        : variant === "success"
          ? CheckCircle
          : variant === "warning"
            ? AlertTriangle
            : Info;

    const renderIcon = icon || <DefaultIcon className="h-5 w-5" />;

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full items-start gap-3 rounded-md border p-4 shadow-sm transition-all",
          {
            "border-gray-200 bg-gray-50 text-gray-900": variant === "neutral",
            "border-blue-200 bg-blue-50 text-blue-900": variant === "brand",
            "border-red-200 bg-red-50 text-red-900": variant === "error",
            "border-green-200 bg-green-50 text-green-900":
              variant === "success",
            "border-yellow-200 bg-yellow-50 text-yellow-900":
              variant === "warning",
          },
          className,
        )}
        {...props}
      >
        <div
          className={cn("mt-0.5 shrink-0", {
            "text-gray-600": variant === "neutral",
            "text-blue-600": variant === "brand",
            "text-red-600": variant === "error",
            "text-green-600": variant === "success",
            "text-yellow-600": variant === "warning",
          })}
        >
          {renderIcon}
        </div>
        <div className="flex flex-col gap-1">
          {title && (
            <h5 className="font-medium leading-none tracking-tight">{title}</h5>
          )}
          {description && (
            <div className="text-sm opacity-90 leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Alert.displayName = "Alert";
export { Alert };

import React from "react";
import cn from "@/app/utils/cn";

type Props<T extends React.ElementType> = {
  as?: T;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
} & Omit<
  React.ComponentPropsWithRef<T>,
  "as" | "disabled" | "className" | "children"
>;

export default function CardButton<T extends React.ElementType = "button">({
  children,
  className,
  as,
  disabled,
  ...restProps
}: Props<T>) {
  const Component = as || "button";

  return (
    <Component
      className={cn(
        "transition flex items-center justify-center gap-2 p-4 cursor-pointer rounded-full",
        "bg-white hover:bg-gray-100 border-gray text-gray-600",
        disabled && "opacity-50 cursor-not-allowed",
        "outline outline-offset-2 outline-gray-500",
        className
      )}
      // Only set type="button" if rendering a native button and no type is provided
      {...(Component === "button"
        ? {
            type:
              (restProps as React.ButtonHTMLAttributes<HTMLButtonElement>)
                .type ?? "button",
          }
        : {})}
      {...(Component === "button" ? { disabled } : {})}
      {...restProps}
    >
      {children}
    </Component>
  );
}

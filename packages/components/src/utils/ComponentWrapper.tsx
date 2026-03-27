import React, { CSSProperties, ElementType, ComponentPropsWithoutRef } from "react";

type ComponentWrapperProps<T extends ElementType = "div"> = {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "className" | "style" | "children" | "as">;

/**
 * Base wrapper component for all scaffold-ui components.
 * Uses `font-sui` (font-family: var(--font-sui-family)); override `--font-sui-family` in global CSS to theme typography.
 */
export const DefaultStylesWrapper = <T extends ElementType = "div">({
  children,
  className = "",
  style,
  as,
  ...props
}: ComponentWrapperProps<T>) => {
  const Component = as || "div";
  return (
    <Component
      className={`${className} font-sui`}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

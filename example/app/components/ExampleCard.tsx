"use client";

import React from "react";

export type ExampleCardProps = {
  title: string;
  /** Small uppercase label above the title (e.g. “Connected address”). */
  label?: string;
  /** Muted description under the title. */
  description?: string;
  /** Icon inside the gradient circle; omit for a plain gradient dot. */
  icon?: React.ReactNode;
  children: React.ReactNode;
  /** Footer row (e.g. primary CTA). */
  footer?: React.ReactNode;
  /** Wider cards for feature grids; default keeps showcase width. */
  maxWidth?: "showcase" | "wide" | "full";
  /** Padding density */
  padding?: "default" | "comfortable";
  /** `start`: demo left-aligned with the title column (default). `center`: centered showcase. */
  align?: "center" | "start";
  className?: string;
};

export const ExampleCard: React.FC<ExampleCardProps> = ({
  title,
  label,
  description,
  icon,
  children,
  footer,
  maxWidth = "showcase",
  padding = "default",
  align = "start",
  className = "",
}) => {
  const widthClass = maxWidth === "wide" ? "max-w-4xl" : maxWidth === "full" ? "max-w-none w-full" : "max-w-xl";
  const paddingClass = padding === "comfortable" ? "p-8" : "p-6";

  const isStart = align === "start";
  const bodyAlign = isStart ? "items-stretch" : "items-center";
  const footerAlign = isStart ? "items-stretch" : "items-center";
  /** Indent demo so it lines up with the title (past gradient dot + gap-3). */
  const demoInset = isStart ? (icon ? "pl-[2.75rem]" : "pl-10") : "";

  const dotSize = icon ? "h-8 w-8" : "h-7 w-7";
  const iconSize = "[&_svg]:h-4 [&_svg]:w-4";

  return (
    <div className={`w-full ${widthClass} mx-auto ${className}`}>
      <div
        className={`bg-base-100 rounded-2xl shadow-md border border-base-300 ${paddingClass} flex flex-col items-stretch text-left hover:shadow-lg transition-shadow`}
      >
        {label ? (
          <p className="font-semibold text-xs text-base-content/60 uppercase tracking-wider m-0 mb-3 w-full">{label}</p>
        ) : null}
        <div className="flex w-full gap-3 items-start">
          <div
            className={`rounded-full hedera-gradient mt-0.5 flex shrink-0 items-center justify-center ${dotSize}`}
            aria-hidden
          >
            {icon ? <span className={`text-white ${iconSize}`}>{icon}</span> : null}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 font-bold text-lg leading-snug">{title}</h3>
            {description ? (
              <p className="m-0 mt-1.5 max-w-prose text-sm leading-relaxed text-base-content/70">{description}</p>
            ) : null}
          </div>
        </div>
        <div className={`mt-5 w-full flex flex-col ${bodyAlign} ${demoInset} ${isStart ? "" : "text-center"}`}>
          {children}
        </div>
        {footer ? <div className={`mt-6 w-full flex flex-col gap-2 ${footerAlign}`}>{footer}</div> : null}
      </div>
    </div>
  );
};

"use client";

import React, { ElementType, ReactNode, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import FocusInContractText from "@/components/reuseable/FocusInContractText";
import { cn } from "@/lib/utils";

export interface UnderlineTextButtonProps {
  children?: ReactNode;
  text?: string;
  href?: string;
  onClick?: () => void;
  as?: ElementType;
  showArrow?: boolean;
  arrowClassName?: string;
  className?: string;
  lineColor?: string;
  textColor?: string;
}

export default function UnderlineTextButton({
  children,
  text,
  href,
  onClick,
  as: Component = href ? "a" : "button",
  showArrow = true,
  arrowClassName = "",
  className = "",
  lineColor = "border-black",
  textColor = "text-[#141414]",
}: UnderlineTextButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const label = text || children;

  return (
    <Component
      href={href}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group inline-flex items-center gap-2 border-b pb-1 font-mono text-xs sm:text-sm uppercase tracking-widest transition-colors duration-300 no-underline cursor-pointer select-none",
        lineColor,
        textColor,
        className
      )}
    >
      <FocusInContractText isHovered={isHovered} as="span" duration={0.4}>
        {label}
      </FocusInContractText>

      {showArrow && (
        <ArrowUpRight
          className={cn(
            "size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
            arrowClassName
          )}
        />
      )}
    </Component>
  );
}

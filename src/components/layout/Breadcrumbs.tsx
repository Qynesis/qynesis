"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((x) => x);

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-blue">
      <Link href="/" className="text-muted-blue hover:text-slate-800 transition-colors flex items-center">
        <Home className="w-4 h-4" />
      </Link>

      {segments.map((segment, index) => {
        const url = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const displayName = segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        return (
          <div key={url} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-muted-blue shrink-0" />
            {isLast ? (
              <span className="text-[#2F65C8] font-normal">{displayName}</span>
            ) : (
              <Link href={url} className="text-muted-blue hover:text-slate-800 transition-colors no-underline font-normal">
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

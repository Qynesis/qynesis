"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Breadcrumbs from "./Breadcrumbs";
import { NavGroup } from "@/lib/nav";
import { usePathname } from "next/navigation";

interface DashboardShellProps {
  children: React.ReactNode;
  navGroups: NavGroup[];
  logoText: string;
  title: string;
  description: string;
}

const routeDescriptions: Record<string, string> = {
  "Overview": "Welcome back to your administration control center.",
  "Dynamic Table": "Manage database records using a powerful dynamic table.",
  "Dynamic Form": "Build and submit validation-ready dynamic forms.",
  "Employees": "Manage staff records, roles, and profiles.",
  "Marketing": "Monitor campaigns, traffic growth, and outreach stats.",
  "System Settings": "Configure system settings, integrations, and preferences.",
  "Help & Support": "Access documentation and raise customer support tickets.",
};

export default function DashboardShell({
  children,
  navGroups,
  logoText,
  title,
  description,
}: DashboardShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Dynamically find active route details
  const findActiveItem = (): { name: string; description?: string } | null => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.path === pathname) {
          return { name: item.name, description: routeDescriptions[item.name] };
        }
        if (item.children) {
          for (const child of item.children) {
            if (child.path === pathname) {
              return { name: child.name, description: routeDescriptions[child.name] };
            }
          }
        }
      }
    }
    return null;
  };

  const activeItem = findActiveItem();
  const displayTitle = activeItem ? activeItem.name : title;
  const displayDescription = activeItem?.description || description;

  return (
    <div className="flex h-screen overflow-hidden bg-layout-bg dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar navGroups={navGroups} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Backdrop overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 sm:hidden transition-opacity duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header */}
        <Header 
          title={displayTitle} 
          description={displayDescription} 
          onMenuClick={() => setIsMobileOpen(true)} 
        />

        {/* Content View */}
        <main className="flex-1 px-6 py-6">
          {/* Breadcrumbs & Header Details */}
          <div className="mb-4 px-2">
            <Breadcrumbs />
          </div>

          {/* Children views */}
          {children}
        </main>
      </div>
    </div>
  );
}

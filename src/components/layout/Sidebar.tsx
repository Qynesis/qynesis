"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { NavGroup, NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import Logo from "@/components/common/Logo";

interface SidebarProps {
  navGroups: NavGroup[];
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const exactMatchPaths = ["/admin", "/user"];



const isRouteActive = (item: NavItem, pathname: string): boolean => {
  if (!item.path) return false;

  if (pathname === item.path) return true;

  if (exactMatchPaths.includes(item.path)) return false;

  if (item.path !== "/" && pathname.startsWith(item.path + "/")) return true;

  if (item.children) {
    return item.children.some((child) => isRouteActive(child, pathname));
  }

  return false;
};

const hasActiveChild = (menuItem: NavItem, path: string): boolean => {
  if (!menuItem.children) return false;
  return menuItem.children.some(
    (child) => isRouteActive(child, path) || hasActiveChild(child, path)
  );
};

const SidebarItem = ({ item, pathname, depth = 0 }: { item: NavItem; pathname: string; depth?: number }) => {
  const [isOpen, setIsOpen] = useState(() => hasActiveChild(item, pathname));
  const hasChildren = !!item.children?.length;
  const isActive = isRouteActive(item, pathname);

  const Icon = item.icon;

  return (
    <div className="w-full">
      {hasChildren ? (
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center justify-between w-full rounded-xl transition-all duration-200 group cursor-pointer",
              depth === 0 ? "h-12 px-4 text-base font-semibold" : "h-10 px-3 text-[15px] font-medium",
              isActive 
                ? depth === 0
                  ? "bg-brand-gradient text-white font-semibold"
                  : "text-secondary-brand font-semibold"
                : "text-muted-blue hover:bg-light-background hover:text-primary-text"
            )}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className={cn("shrink-0 transition-colors", 
                depth === 0 ? "w-6 h-6" : "w-4 h-4",
                isActive
                  ? depth === 0 ? "text-white" : "text-secondary-brand"
                  : "text-muted-blue group-hover:text-primary-text"
              )} />}
              <span className="truncate">{item.name}</span>
            </div>
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200 shrink-0",
                isActive
                  ? depth === 0 ? "text-white" : "text-secondary-brand"
                  : "text-muted-blue group-hover:text-primary-text",
                isOpen && "rotate-90"
              )}
            />
          </button>
          {isOpen && (
            <div className={cn(
              "mt-1 space-y-1 border-l border-border animate-in slide-in-from-top-1 duration-200",
              depth === 0 ? "ml-6 pl-3" : "ml-3 pl-2 border-l-border/60"
            )}>
              {item.children!.map((child) => (
                <SidebarItem key={child.path} item={child} pathname={pathname} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Link
          href={item.path}
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all duration-200 group",
            depth === 0 ? "h-12 px-4 text-base font-semibold" : "h-10 px-3 text-[15px] font-medium",
            isActive
              ? depth === 0
                ? "bg-brand-gradient text-white font-semibold"
                : "text-secondary-brand font-semibold"
              : "text-muted-blue hover:bg-light-background hover:text-primary-text"
          )}
        >
          {Icon && <Icon className={cn("shrink-0 transition-colors", 
            depth === 0 ? "w-6 h-6" : "w-4 h-4",
            isActive
              ? depth === 0 ? "text-white" : "text-secondary-brand"
              : "text-muted-blue group-hover:text-primary-text"
          )} />}
          <span className="truncate">{item.name}</span>
        </Link>
      )}
    </div>
  );
};

export default function Sidebar({ navGroups, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const w = window.innerWidth;
    if (w < 640) return false;
    if (w < 1280) return true;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  const prevBreakpoint = useRef<"mobile" | "sm-xl" | "xl">("xl");

  useEffect(() => {
    const getBreakpoint = (w: number): "mobile" | "sm-xl" | "xl" =>
      w < 640 ? "mobile" : w < 1280 ? "sm-xl" : "xl";

    const handleResize = () => {
      const w = window.innerWidth;
      const bp = getBreakpoint(w);
      setIsMobile(w < 640);

      if (bp === "sm-xl" && prevBreakpoint.current === "xl") {
        setIsCollapsed(true);
      }
      if (bp === "xl" && prevBreakpoint.current === "sm-xl") {
        setIsCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
      }
      prevBreakpoint.current = bp;
    };

    prevBreakpoint.current =
      window.innerWidth < 640 ? "mobile" : window.innerWidth < 1280 ? "sm-xl" : "xl";

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (window.innerWidth >= 1280) {
      localStorage.setItem("sidebar-collapsed", String(nextState));
    }
  };

  const showCollapsed = isCollapsed && !isMobile;

  return (
    <aside
      className={cn(
        "bg-primary-background text-primary-text h-screen flex flex-col transition-all duration-300 z-50 shrink-0 shadow-lg",
        // Desktop layouts
        "sm:sticky sm:top-0 sm:translate-x-0",
        showCollapsed ? "sm:w-20" : "sm:w-[280px]",
        // Mobile layouts (drawer overlay style)
        "fixed left-0 top-0 h-screen w-[280px] sm:static",
        isMobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
      )}
    >
      {/* Floating Collapse/Expand Button aligned exactly on the border intersection */}
      {isMounted && (
        <button
          onClick={toggleCollapse}
          className="absolute right-[-12px] top-20 z-50 transform -translate-y-1/2 w-6 h-6 rounded-full bg-primary-background border border-border hidden sm:flex items-center justify-center cursor-pointer hover:border-border transition-colors text-secondary-text hover:text-primary-text focus:outline-none"
        >
          {showCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Sidebar Header with Site-styled BaseKit Logo - h-20 to align with Top Header */}
      <div className={cn("h-20 flex items-center justify-center border-b border-border shrink-0", showCollapsed ? "px-1" : "px-4")}>
        <Link href={navGroups[0]?.items?.[0]?.path || "/"} className="w-full no-underline outline-none">
          <Logo collapsed={showCollapsed} className="w-full justify-center sm:justify-start" />
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7 scrollbar-thin scrollbar-thumb-slate-200">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            {!showCollapsed && (
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-blue px-4 block">
                {group.group}
              </span>
            )}
            <div className="space-y-2">
              {group.items.map((item) =>
                showCollapsed ? (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center justify-center h-12 rounded-xl transition-all duration-200",
                      isRouteActive(item, pathname)
                        ? "bg-brand-gradient text-white"
                        : "text-muted-blue hover:bg-light-background hover:text-primary-text"
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "w-6 h-6 shrink-0",
                          isRouteActive(item, pathname)
                            ? "text-white"
                            : "text-muted-blue hover:text-primary-text"
                        )}
                      />
                    )}
                  </Link>
                ) : (
                  <SidebarItem key={item.path} item={item} pathname={pathname} />
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Card at Bottom */}
      <div className="p-4 pb-6 border-t border-border mt-auto shrink-0">
        {showCollapsed ? (
          <div className="flex flex-col items-center gap-4">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                alt="User Avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl border border-border object-cover"
              />
            <button className="text-muted-blue hover:text-red-500 transition-colors cursor-pointer">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-primary-background">
            <div className="flex items-center gap-3">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                alt="User Avatar"
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl border border-border object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-primary-text leading-tight">Alex</span>
                <span className="text-xs text-muted-blue leading-tight mt-0.5">Manager Admin</span>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = "/"}
              className="text-muted-blue hover:text-red-500 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

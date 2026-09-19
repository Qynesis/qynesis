"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, Menu, Check, CheckCheck, BellOff } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import UserProfile from "@/components/common/UserProfile";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  description?: string;
  onMenuClick?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "New User Registered",
    description: "Alex joined the reseller admin platform as a Manager.",
    time: "2 mins ago",
    read: false,
  },
  {
    id: "2",
    title: "System Performance Alert",
    description: "Database latency spiked above 250ms on node-1b.",
    time: "10 mins ago",
    read: false,
  },
  {
    id: "3",
    title: "Billing Invoice Paid",
    description: "Invoice #1092-B has been paid by Client BaseKit.",
    time: "1 hour ago",
    read: true,
  },
  {
    id: "4",
    title: "Security Policy Updated",
    description: "Multi-factor authentication (MFA) requirements updated for all administrators.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "5",
    title: "Backup Completed",
    description: "Automated nightly backup completed successfully for database cluster storage.",
    time: "5 hours ago",
    read: true,
  },
];

export default function Header({ title, description, onMenuClick }: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="relative h-20 bg-primary-background sticky top-0 z-30 flex items-center shrink-0 mx-6 rounded-b-xl shadow-md">
      <div className="flex items-center justify-between w-full px-6">
        {/* Left Side: Hamburger & Title & Description */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg hover:bg-light-background text-secondary-text hover:text-primary-text sm:hidden cursor-pointer shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-primary-text leading-tight truncate">
              {title || "Overview"}
            </h1>
            {description && (
              <p className="text-xs text-muted-blue mt-0.5 font-medium hidden sm:block truncate">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 h-full">
          {/* Search Input */}
          <div className="static sm:relative flex items-center h-full" ref={searchRef}>
            {/* Desktop Search */}
            <div className="relative w-60 hidden lg:block transition-all duration-300">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="size-5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 h-11 bg-light-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-primary-text placeholder:text-slate-400"
              />
            </div>

            {/* Mobile/Tablet Search Icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-slate-500 hover:text-primary-text hover:bg-light-background rounded-lg transition-colors cursor-pointer lg:hidden"
            >
              <Search className="size-6" />
            </button>

            {/* Mobile/Tablet Search Popover */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 sm:mt-7 w-auto sm:w-72 bg-primary-background border border-border rounded-lg p-2 z-50 shadow-lg animate-in fade-in zoom-in-95 duration-100 lg:hidden">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-5 h-5 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    autoFocus
                    className="w-full pl-9 pr-4 py-2 bg-light-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-primary-text placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown Container */}
          <div className="static sm:relative flex items-center h-full" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="size-11 text-slate-500 hover:text-primary-text hover:bg-light-background rounded-lg relative transition-colors cursor-pointer flex items-center justify-center"
            >
              <Bell className="size-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white scale-85 origin-top-right">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotifOpen && (
              <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 sm:mt-8 w-auto sm:w-80 bg-primary-background border border-border rounded-lg py-2 z-50 shadow-lg animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border mb-1">
                  <p className="text-xs text-primary-text font-bold uppercase tracking-wider">
                    Notifications
                  </p>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                      <BellOff className="w-8 h-8 opacity-40 mb-1" />
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "px-4 py-3 hover:bg-light-background transition-colors flex gap-3 items-start",
                          !n.read && "bg-blue-50/10 dark:bg-blue-900/10"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <p className={cn("text-xs truncate font-semibold", n.read ? "text-secondary-text" : "text-primary-text")}>
                              {n.title}
                            </p>
                            <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-secondary-text mt-0.5 line-clamp-2">
                            {n.description}
                          </p>
                        </div>
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-blue-500 hover:text-blue-700 p-1 hover:bg-light-background rounded-full shrink-0 cursor-pointer"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-border mt-1 pt-1.5 px-3">
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="w-full text-center text-xs font-semibold text-secondary-text hover:text-blue-600 py-1.5 hover:bg-light-background rounded-lg transition-colors cursor-pointer"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="h-6 w-px bg-border"></div>

          {/* User Profile */}
          <UserProfile />
        </div>
      </div>

      {/* View All Notifications Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-primary-background rounded-xl border border-border max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-lg font-semibold text-primary-text">All Notifications</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-secondary-text hover:text-primary-text font-semibold text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "p-4 rounded-lg border flex gap-3 items-start",
                    n.read 
                      ? "border-border bg-light-background/50" 
                      : "border-blue-500/20 bg-blue-500/5"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={cn("text-sm font-semibold", n.read ? "text-secondary-text" : "text-primary-text")}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-secondary-text mt-1 leading-relaxed">{n.description}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-blue-500 hover:text-blue-700 p-1 hover:bg-light-background rounded-full shrink-0 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

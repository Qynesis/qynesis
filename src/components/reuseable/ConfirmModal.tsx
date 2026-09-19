"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  variant?: "danger" | "warning" | "info" | "success";
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant = "info",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}: ConfirmModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: ShieldAlert,
          iconColor: "text-red-500",
          iconBg: "bg-red-500/10",
          btnClass: "bg-red-600 hover:bg-red-750 text-white hover:shadow-lg hover:shadow-red-500/10 border-transparent",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-amber-500",
          iconBg: "bg-amber-500/10",
          btnClass: "bg-amber-500 hover:bg-amber-600 text-white hover:shadow-lg hover:shadow-amber-500/10 border-transparent",
        };
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-emerald-500",
          iconBg: "bg-emerald-500/10",
          btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-500/10 border-transparent",
        };
      case "info":
      default:
        return {
          icon: Info,
          iconColor: "text-blue-500",
          iconBg: "bg-blue-500/10",
          btnClass: "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/10 border-transparent",
        };
    }
  };

  const config = getVariantStyles();
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <DialogHeader className="flex flex-row items-start gap-4 space-y-0 text-left">
          <div className={cn("p-3 rounded-xl flex-shrink-0", config.iconBg, config.iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl h-11 border-gray-200 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-700 dark:text-gray-300 font-bold text-xs"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn("flex-1 rounded-xl h-11 font-bold text-xs", config.btnClass)}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

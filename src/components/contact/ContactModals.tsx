"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type Lenis from "lenis";
import ProjectInquiryForm from "./ProjectInquiryForm";
import BookingFlow from "./BookingFlow";

const EASE = [0.22, 1, 0.36, 1] as const;

type ModalKind = "inquiry" | "booking";

interface ContactModalsValue {
  /** Opens the project inquiry form. `source` is shown in the email. */
  openInquiry: (source: string) => void;
  /** Opens the discovery call booking calendar */
  openBooking: (source: string) => void;
}

const ContactModalsContext = createContext<ContactModalsValue | null>(null);

export function useContactModals(): ContactModalsValue {
  const ctx = useContext(ContactModalsContext);
  if (!ctx) throw new Error("useContactModals must be used inside <ContactModalsProvider>");
  return ctx;
}

const getLenis = () => (window as Window & { __lenis?: Lenis }).__lenis;

// ─── Modal shell ──────────────────────────────────────────────────────────────
interface ModalShellProps {
  open: boolean;
  theme: "dark" | "light";
  labelledBy: string;
  maxWidth: string;
  onClose: () => void;
  children: React.ReactNode;
}

function ModalShell({ open, theme, labelledBy, maxWidth, onClose, children }: ModalShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Page scroll pauses while open; focus moves in, and back to the trigger after
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    getLenis()?.stop();
    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (panel && !panel.contains(document.activeElement)) panel.focus();
    }, 60);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Keep Tab inside the dialog
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([tabindex="-1"]), textarea, select, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      getLenis()?.start();
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!isClient) return null;

  const dark = theme === "dark";
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal"
          className="fixed inset-0 z-300 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            data-lenis-prevent
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE }}
            className={`relative w-full ${maxWidth} max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl outline-none font-[family-name:var(--font-familjen)] ${
              dark
                ? "bg-[#0a0a0b] text-white border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
                : "bg-white text-[#0b0b0b] shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
            }`}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className={`absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border transition-all duration-300 hover:rotate-90 cursor-pointer ${
                dark
                  ? "border-white/15 bg-transparent text-white hover:bg-white hover:text-black"
                  : "border-black/10 bg-white text-[#0b0b0b] hover:bg-[#0b0b0b] hover:text-white"
              }`}
            >
              <X className="size-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────
export default function ContactModalsProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<{ kind: ModalKind; source: string; id: number } | null>(null);

  const openInquiry = useCallback((source: string) => setModal({ kind: "inquiry", source, id: Date.now() }), []);
  const openBooking = useCallback((source: string) => setModal({ kind: "booking", source, id: Date.now() }), []);
  const close = useCallback(() => setModal(null), []);
  const value = useMemo(() => ({ openInquiry, openBooking }), [openInquiry, openBooking]);

  // Keep the last content mounted while the panel animates out
  const [shown, setShown] = useState(modal);
  if (modal && modal !== shown) setShown(modal);

  return (
    <ContactModalsContext.Provider value={value}>
      {children}

      <ModalShell
        open={modal?.kind === "inquiry"}
        theme="dark"
        labelledBy="inquiry-title"
        maxWidth="sm:max-w-3xl"
        onClose={close}
      >
        {shown?.kind === "inquiry" && (
          <div className="p-6 pt-14 sm:p-10 md:p-12">
            <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Discuss your project</p>
            <h2 id="inquiry-title" className="mt-3 text-4xl md:text-5xl tracking-tight">
              Tell us what you&apos;re building
            </h2>
            <p className="mt-3 mb-10 max-w-lg text-neutral-400 leading-relaxed">
              Share a few details and our team will get back to you within one business day.
            </p>
            <ProjectInquiryForm key={shown.id} source={shown.source} autoFocus />
          </div>
        )}
      </ModalShell>

      <ModalShell
        open={modal?.kind === "booking"}
        theme="light"
        labelledBy="booking-title"
        maxWidth="sm:max-w-[1000px]"
        onClose={close}
      >
        {shown?.kind === "booking" && <BookingFlow key={shown.id} source={shown.source} onClose={close} />}
      </ModalShell>
    </ContactModalsContext.Provider>
  );
}

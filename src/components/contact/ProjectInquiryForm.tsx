"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import CtaLink from "@/components/reuseable/CtaLink";
import { BUDGET_OPTIONS, OTHER_SERVICE, SERVICE_OPTIONS } from "@/data/contactOptions";

const EASE = [0.22, 1, 0.36, 1] as const;

const fieldBase =
  "w-full rounded-md border bg-transparent text-white text-sm md:text-[15px] placeholder:text-[#636b78] outline-none transition-[border-color,background-color] duration-200 focus:border-[#4a5160] focus:bg-white/3";
const fieldBorder = (invalid: boolean) => (invalid ? "border-red-400/70" : "border-[#22262e]");

// ─── Dropdown ────────────────────────────────────────────────────────────────
interface SelectFieldProps {
  value: string;
  placeholder: string;
  options: string[];
  invalid?: boolean;
  onChange: (value: string) => void;
}

/** A dark dropdown rendered in place (no portal), so it also works inside modals */
function SelectField({ value, placeholder, options, invalid = false, onChange }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const focusOption = (index: number) =>
    optionRefs.current[(index + options.length) % options.length]?.focus();

  const openAndFocus = () => {
    setOpen(true);
    requestAnimationFrame(() => focusOption(Math.max(0, options.indexOf(value))));
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const current = optionRefs.current.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusOption(current + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusOption(current - 1);
    } else if (e.key === "Escape") {
      // Close the list only (not a surrounding modal)
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openAndFocus())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openAndFocus();
          }
        }}
        className={`${fieldBase} ${fieldBorder(invalid)} h-12 px-5 flex items-center justify-between text-left cursor-pointer`}
      >
        <span className={value ? "text-white" : "text-[#636b78]"}>{value || placeholder}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-neutral-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            onKeyDown={onListKeyDown}
            data-lenis-prevent
            className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-[min(22rem,60vh)] origin-top overflow-y-auto rounded-md border border-[#22262e] bg-[#0b0b0c]/95 p-1 shadow-[0_24px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          >
            {options.map((option, i) => (
              <button
                key={option}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`flex w-full items-center justify-between rounded px-4 py-2.5 text-left text-sm outline-none transition-colors bg-transparent cursor-pointer hover:bg-white/8 hover:text-white focus-visible:bg-white/8 focus-visible:text-white ${
                  option === value ? "text-white" : "text-neutral-300"
                }`}
              >
                {option}
                {option === value && <span className="size-1.5 rounded-full bg-white" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
interface ProjectInquiryFormProps {
  /** Shown in the email so the studio knows where it came from */
  source: string;
  /** Focus the first field when shown (modals) */
  autoFocus?: boolean;
}

interface FormValues {
  name: string;
  email: string;
  company: string;
  service: string;
  otherService: string;
  message: string;
  budget: string;
  trap: string; // spam trap, hidden from people
}

const EMPTY: FormValues = {
  name: "",
  email: "",
  company: "",
  service: "",
  otherService: "",
  message: "",
  budget: "",
  trap: "",
};

type Errors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Please enter a valid email.";
  if (!values.service) errors.service = "Please choose a service.";
  if (values.service === OTHER_SERVICE && values.otherService.trim().length < 2)
    errors.otherService = "Tell us what you need.";
  if (values.message.trim().length < 10) errors.message = "A few more words about your project, please.";
  return errors;
}

/** The project inquiry form (contact page and the "Discuss your project" modal). Emails the studio. */
export default function ProjectInquiryForm({ source, autoFocus = false }: ProjectInquiryFormProps) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [sentName, setSentName] = useState("");

  const errors = showErrors ? validate(values) : {};
  const set = (key: keyof FormValues) => (value: string) => setValues((v) => ({ ...v, [key]: value }));
  const onInput =
    (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(key)(e.target.value);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    if (Object.keys(validate(values)).length) {
      setShowErrors(true);
      return;
    }
    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setSentName(values.name.trim().split(/\s+/)[0]);
      setValues(EMPTY);
      setShowErrors(false);
      setStatus("sent");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  const errorText = (key: keyof FormValues) =>
    errors[key] ? <p className="mt-1.5 text-xs text-red-400/90">{errors[key]}</p> : null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "sent" ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col items-center py-16 text-center"
          role="status"
        >
          <svg viewBox="0 0 52 52" className="mb-7 size-16 text-white" aria-hidden="true">
            <motion.circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: EASE }}
            />
            <motion.path
              d="M15 27l7 7 15-16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.5, ease: EASE }}
            />
          </svg>
          <h3 className="text-3xl md:text-4xl tracking-tight text-white">Thank you{sentName ? `, ${sentName}` : ""}.</h3>
          <p className="mt-4 max-w-md text-neutral-400 leading-relaxed">
            Your inquiry is on its way to our team. We usually reply within one business day.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-8 text-xs uppercase tracking-widest text-neutral-400 underline-offset-4 hover:text-white hover:underline bg-transparent cursor-pointer"
          >
            Send another inquiry
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          noValidate
          onSubmit={onSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="contact-form relative grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {/* Honeypot: bots fill every input in the markup. display:none (not off-screen)
              because browsers autofill off-screen fields but skip ones that aren't rendered */}
          <div aria-hidden="true" className="hidden">
            {/* A name autofill doesn't recognise, so browsers leave it empty */}
            <input
              tabIndex={-1}
              autoComplete="off"
              name="qyn_hp_x"
              data-1p-ignore
              data-lpignore="true"
              value={values.trap}
              onChange={onInput("trap")}
            />
          </div>

          <div>
            <input
              type="text"
              name="name"
              aria-label="Full name"
              placeholder="Full Name"
              autoComplete="name"
              autoFocus={autoFocus}
              value={values.name}
              onChange={onInput("name")}
              aria-invalid={!!errors.name || undefined}
              className={`${fieldBase} ${fieldBorder(!!errors.name)} h-12 px-5`}
            />
            {errorText("name")}
          </div>

          <div>
            <input
              type="email"
              name="email"
              aria-label="Email address"
              placeholder="Email address"
              autoComplete="email"
              value={values.email}
              onChange={onInput("email")}
              aria-invalid={!!errors.email || undefined}
              className={`${fieldBase} ${fieldBorder(!!errors.email)} h-12 px-5`}
            />
            {errorText("email")}
          </div>

          <div>
            <input
              type="text"
              name="company"
              aria-label="Company or website name"
              placeholder="Company / Website name"
              autoComplete="organization"
              value={values.company}
              onChange={onInput("company")}
              className={`${fieldBase} ${fieldBorder(false)} h-12 px-5`}
            />
          </div>

          <div>
            <SelectField
              value={values.service}
              placeholder="Select a service"
              options={SERVICE_OPTIONS}
              invalid={!!errors.service}
              onChange={set("service")}
            />
            {errorText("service")}
          </div>

          {/* "Other" opens a box to describe the service */}
          <AnimatePresence initial={false}>
            {values.service === OTHER_SERVICE && (
              <motion.div
                key="other"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="md:col-span-2 overflow-hidden"
              >
                <input
                  type="text"
                  name="otherService"
                  aria-label="Describe the service you need"
                  placeholder="Please specify the service you need"
                  autoFocus
                  value={values.otherService}
                  onChange={onInput("otherService")}
                  aria-invalid={!!errors.otherService || undefined}
                  className={`${fieldBase} ${fieldBorder(!!errors.otherService)} h-12 px-5`}
                />
                {errorText("otherService")}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="md:col-span-2">
            <textarea
              name="message"
              aria-label="About your project"
              placeholder="Share a little about your goals, timeline, and requirements..."
              rows={4}
              value={values.message}
              onChange={onInput("message")}
              aria-invalid={!!errors.message || undefined}
              data-lenis-prevent
              className={`${fieldBase} ${fieldBorder(!!errors.message)} block resize-none p-5`}
            />
            {errorText("message")}
          </div>

          <div>
            <SelectField
              value={values.budget}
              placeholder="Select your estimated budget"
              options={BUDGET_OPTIONS}
              onChange={set("budget")}
            />
          </div>

          <div className="flex flex-col items-stretch justify-end gap-3 pb-2 md:items-end">
            <CtaLink
              type="submit"
              label={status === "sending" ? "Sending…" : "Send inquiry"}
              disabled={status === "sending"}
              className="w-full max-w-none justify-between text-sm md:max-w-65"
            />
          </div>

          <AnimatePresence>
            {status === "error" && serverError && (
              <motion.p
                key="server-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="md:col-span-2 text-sm text-red-400/90"
              >
                {serverError}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

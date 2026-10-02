"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Globe, Video } from "lucide-react";
import { BOOKING, slotsForLocalDay } from "@/data/booking";
import { RollingText, SwapArrow } from "@/components/reuseable/CtaLink";

const EASE = [0.22, 1, 0.36, 1] as const;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DayRef {
  year: number;
  month: number;
  day: number;
}
const sameDay = (a: DayRef | null, b: DayRef) => !!a && a.year === b.year && a.month === b.month && a.day === b.day;
const dayKey = (d: DayRef) => `${d.year}-${d.month}-${d.day}`;

const fmt = {
  month: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }),
  dayLong: new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }),
  time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }),
};

function timeZoneLabel(now: Date) {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const offset =
    new Intl.DateTimeFormat("en-US", { timeZoneName: "shortOffset" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  return { zone, label: `${zone.replace(/_/g, " ")}${offset ? ` (${offset})` : ""}` };
}

/** First day (in the next couple of months) that has any slot */
function firstBookableDay(now: Date): DayRef | null {
  for (let i = 0; i <= BOOKING.daysAhead; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const ref = { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
    if (slotsForLocalDay(ref.year, ref.month, ref.day, now).length) return ref;
  }
  return null;
}

const inputClass =
  "w-full rounded-xl border border-black/15 bg-transparent px-4 text-[15px] text-[#0b0b0b] placeholder:text-black/35 outline-none transition-colors duration-200 focus:border-black";

interface BookingFlowProps {
  source: string;
  onClose: () => void;
}

/** Pick a day, then a time, then add details: books a discovery call and emails the studio */
export default function BookingFlow({ source, onClose }: BookingFlowProps) {
  const [now] = useState(() => new Date());
  const { zone, label: zoneLabel } = useMemo(() => timeZoneLabel(now), [now]);
  const initialDay = useMemo(() => firstBookableDay(now), [now]);

  const [view, setView] = useState(() => ({
    year: (initialDay ?? { year: now.getFullYear() }).year,
    month: (initialDay ?? { month: now.getMonth() }).month,
  }));
  const [direction, setDirection] = useState(1);
  const [selectedDay, setSelectedDay] = useState<DayRef | null>(initialDay);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [step, setStep] = useState<"schedule" | "details" | "done">("schedule");
  const [details, setDetails] = useState({ name: "", email: "", note: "", trap: "" });
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  // Month grid with availability (Monday-first)
  const grid = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const leading = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const cells: ({ ref: DayRef; available: boolean; today: boolean } | null)[] = Array(leading).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const ref = { year: view.year, month: view.month, day };
      cells.push({
        ref,
        available: slotsForLocalDay(view.year, view.month, day, now).length > 0,
        today:
          now.getFullYear() === view.year && now.getMonth() === view.month && now.getDate() === day,
      });
    }
    return cells;
  }, [view, now]);

  const slots = useMemo(
    () => (selectedDay ? slotsForLocalDay(selectedDay.year, selectedDay.month, selectedDay.day, now) : []),
    [selectedDay, now],
  );

  // Months that can hold bookable days
  const lastBookable = new Date(now.getTime() + BOOKING.daysAhead * 86_400_000);
  const canGoBack = view.year > now.getFullYear() || (view.year === now.getFullYear() && view.month > now.getMonth());
  const canGoForward =
    view.year < lastBookable.getFullYear() ||
    (view.year === lastBookable.getFullYear() && view.month < lastBookable.getMonth());

  const shiftMonth = (delta: number) => {
    setDirection(delta);
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const pickDay = (ref: DayRef) => {
    if (sameDay(selectedDay, ref)) return;
    setSelectedDay(ref);
    setSelectedSlot(null);
  };

  const detailErrors = {
    name: details.name.trim().length < 2 ? "Please enter your name." : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim()) ? "" : "Please enter a valid email.",
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || status === "sending") return;
    if (detailErrors.name || detailErrors.email) {
      setShowErrors(true);
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/book-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, start: selectedSlot.toISOString(), timeZone: zone, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (res.status === 409) {
          setSelectedSlot(null);
          setStep("schedule");
        }
        throw new Error(data.error || "Something went wrong.");
      }
      setStatus("idle");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  const whenLabel = selectedSlot
    ? `${fmt.dayLong.format(selectedSlot)} · ${fmt.time.format(selectedSlot)}`
    : selectedDay
      ? fmt.dayLong.format(new Date(selectedDay.year, selectedDay.month, selectedDay.day))
      : "";

  if (step === "done" && selectedSlot) {
    return (
      <motion.div
        key="done"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-col items-center px-6 py-16 text-center md:px-16 md:py-20"
        role="status"
      >
        <svg viewBox="0 0 52 52" className="mb-8 size-20 text-[#0b0b0b]" aria-hidden="true">
          <motion.circle
            cx="26"
            cy="26"
            r="24"
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ originX: "50%", originY: "50%" }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          />
          <motion.path
            d="M15 27l7 7 15-16"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.3, ease: EASE }}
          />
        </svg>
        <p className="text-xs uppercase tracking-[0.3em] text-black/45">Call booked</p>
        <h3 className="mt-3 text-4xl md:text-5xl tracking-tight text-[#0b0b0b]">You&apos;re all set.</h3>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-black/60">
          Thank you, {details.name.trim().split(/\s+/)[0]}. Your {BOOKING.durationMinutes}-minute call is booked for{" "}
          <span className="text-[#0b0b0b]">{whenLabel}</span> ({zoneLabel}). We&apos;ll email{" "}
          <span className="text-[#0b0b0b]">{details.email.trim()}</span> with the meeting link.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#0b0b0b] py-3.5 pl-7 pr-6 text-sm uppercase tracking-widest text-white cursor-pointer"
        >
          <RollingText text="Done" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
      {/* ── Call summary ── */}
      <aside className="border-b border-black/10 bg-[#f4f4f2] p-6 md:border-b-0 md:border-r md:p-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-black/45">Qynesis studio</p>
        <h2 id="booking-title" className="mt-3 text-3xl tracking-tight text-[#0b0b0b]">
          Discovery call
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-black/55">
          A relaxed conversation about your goals, timeline and how we can help: software, AI or brand.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-black/70">
          <li className="flex items-center gap-3">
            <Clock className="size-4 text-black/45" /> {BOOKING.durationMinutes} minutes
          </li>
          <li className="flex items-center gap-3">
            <Video className="size-4 text-black/45" /> Video call, link sent by email
          </li>
          <li className="flex items-start gap-3">
            <Globe className="mt-0.5 size-4 shrink-0 text-black/45" /> {zoneLabel}
          </li>
        </ul>
        <AnimatePresence>
          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-8 rounded-2xl bg-[#0b0b0b] p-5 text-white"
            >
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">Your slot</p>
              <p className="mt-2 text-lg leading-snug">{fmt.dayLong.format(selectedSlot)}</p>
              <p className="text-white/70">
                {fmt.time.format(selectedSlot)} –{" "}
                {fmt.time.format(new Date(selectedSlot.getTime() + BOOKING.durationMinutes * 60_000))}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      <AnimatePresence mode="wait" initial={false}>
        {step === "schedule" ? (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_220px]"
          >
            {/* ── Calendar ── */}
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl tracking-tight text-[#0b0b0b]">Select a date</h3>
                <div className="flex items-center gap-2">
                  {[
                    { delta: -1, enabled: canGoBack, Icon: ChevronLeft, label: "Previous month" },
                    { delta: 1, enabled: canGoForward, Icon: ChevronRight, label: "Next month" },
                  ].map(({ delta, enabled, Icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      disabled={!enabled}
                      onClick={() => shiftMonth(delta)}
                      className="flex size-9 items-center justify-center rounded-full border border-black/10 bg-transparent text-[#0b0b0b] transition-colors duration-200 enabled:cursor-pointer enabled:hover:bg-[#0b0b0b] enabled:hover:text-white disabled:opacity-25"
                    >
                      <Icon className="size-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                  <motion.div
                    key={`${view.year}-${view.month}`}
                    custom={direction}
                    variants={{
                      enter: (d: number) => ({ x: d * 48, opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (d: number) => ({ x: d * -48, opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <p className="mb-4 text-sm text-black/55">{fmt.month.format(new Date(view.year, view.month, 1))}</p>
                    <div className="grid grid-cols-7 gap-y-1 text-center">
                      {WEEKDAYS.map((w) => (
                        <span key={w} className="pb-2 text-[11px] uppercase tracking-wider text-black/35">
                          {w}
                        </span>
                      ))}
                      {grid.map((cell, i) =>
                        cell ? (
                          <div key={dayKey(cell.ref)} className="flex items-center justify-center">
                            <button
                              type="button"
                              disabled={!cell.available}
                              aria-pressed={sameDay(selectedDay, cell.ref)}
                              aria-label={fmt.dayLong.format(new Date(cell.ref.year, cell.ref.month, cell.ref.day))}
                              onClick={() => pickDay(cell.ref)}
                              className={`relative flex size-10 md:size-11 items-center justify-center rounded-full bg-transparent text-[15px] transition-colors duration-200 ${
                                cell.available
                                  ? "cursor-pointer font-medium text-[#0b0b0b] hover:bg-black/6"
                                  : "cursor-not-allowed text-black/20"
                              }`}
                            >
                              {sameDay(selectedDay, cell.ref) && (
                                <motion.span
                                  layoutId="booking-day"
                                  className="absolute inset-0 rounded-full bg-[#0b0b0b]"
                                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                                />
                              )}
                              <span
                                className={`relative transition-colors duration-300 ${
                                  sameDay(selectedDay, cell.ref) ? "text-white" : ""
                                }`}
                              >
                                {cell.ref.day}
                              </span>
                              {cell.today && (
                                <span
                                  className={`absolute bottom-1.5 size-1 rounded-full ${
                                    sameDay(selectedDay, cell.ref) ? "bg-white" : "bg-[#0b0b0b]"
                                  }`}
                                />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span key={`blank-${i}`} />
                        ),
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ── Time slots ── */}
            <div className="flex flex-col border-t border-black/10 p-6 md:p-8 lg:border-l lg:border-t-0 lg:pl-6 lg:pr-6">
              <h3 className="text-xl tracking-tight text-[#0b0b0b]">Select a time</h3>
              <p className="mt-1 min-h-5 text-sm text-black/50">
                {selectedDay ? fmt.dayLong.format(new Date(selectedDay.year, selectedDay.month, selectedDay.day)) : "Pick a day first"}
              </p>
              <div className="relative mt-5 flex-1">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={selectedDay ? dayKey(selectedDay) : "none"}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    data-lenis-prevent
                    className="grid max-h-[300px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 lg:max-h-[340px] lg:grid-cols-1"
                  >
                    {slots.map((slot, i) => {
                      const active = selectedSlot?.getTime() === slot.getTime();
                      return (
                        <motion.button
                          key={slot.toISOString()}
                          type="button"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(i, 12) * 0.025, ease: EASE }}
                          onClick={() => setSelectedSlot(slot)}
                          aria-pressed={active}
                          className={`rounded-xl border py-3 text-sm transition-colors duration-200 cursor-pointer ${
                            active
                              ? "border-[#0b0b0b] bg-[#0b0b0b] text-white"
                              : "border-black/10 bg-transparent text-[#0b0b0b] hover:border-[#0b0b0b]"
                          }`}
                        >
                          {fmt.time.format(slot)}
                        </motion.button>
                      );
                    })}
                    {selectedDay && slots.length === 0 && (
                      <p className="col-span-full text-sm text-black/45">No times left on this day.</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {error}
                </p>
              )}

              <AnimatePresence>
                {selectedSlot && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    onClick={() => {
                      setError("");
                      setStep("details");
                    }}
                    className="group mt-5 inline-flex w-full items-center justify-between rounded-full bg-[#0b0b0b] py-3.5 pl-6 pr-5 text-sm uppercase tracking-widest text-white cursor-pointer"
                  >
                    <RollingText text="Continue" />
                    <SwapArrow />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="details"
            noValidate
            onSubmit={confirm}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="contact-form relative flex flex-col p-6 md:p-8"
          >
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep("schedule");
              }}
              className="mb-6 inline-flex w-max items-center gap-2 text-xs uppercase tracking-widest text-black/50 transition-colors hover:text-[#0b0b0b] bg-transparent cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> Change time
            </button>
            <h3 className="text-2xl tracking-tight text-[#0b0b0b]">Your details</h3>
            <p className="mt-1 text-sm text-black/50">{whenLabel}</p>

            {/* Honeypot (display:none so browser autofill skips it) */}
            <div aria-hidden="true" className="hidden">
              <input
                tabIndex={-1}
                autoComplete="off"
                name="qyn_hp_x"
                data-1p-ignore
                data-lpignore="true"
                value={details.trap}
                onChange={(e) => setDetails((d) => ({ ...d, trap: e.target.value }))}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  name="name"
                  aria-label="Full name"
                  placeholder="Full name"
                  autoComplete="name"
                  autoFocus
                  value={details.name}
                  onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
                  className={`${inputClass} h-12 ${showErrors && detailErrors.name ? "border-red-500/70" : ""}`}
                />
                {showErrors && detailErrors.name && <p className="mt-1.5 text-xs text-red-600">{detailErrors.name}</p>}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  aria-label="Email address"
                  placeholder="Email address"
                  autoComplete="email"
                  value={details.email}
                  onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))}
                  className={`${inputClass} h-12 ${showErrors && detailErrors.email ? "border-red-500/70" : ""}`}
                />
                {showErrors && detailErrors.email && <p className="mt-1.5 text-xs text-red-600">{detailErrors.email}</p>}
              </div>
              <textarea
                name="note"
                aria-label="What would you like to discuss?"
                placeholder="What would you like to discuss? (optional)"
                rows={4}
                value={details.note}
                onChange={(e) => setDetails((d) => ({ ...d, note: e.target.value }))}
                data-lenis-prevent
                className={`${inputClass} block resize-none py-3 sm:col-span-2`}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="mt-4 text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={status === "sending"}
              className="group mt-8 inline-flex w-full items-center justify-between rounded-full bg-[#0b0b0b] py-4 pl-7 pr-6 text-sm uppercase tracking-widest text-white cursor-pointer disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-[280px] sm:self-start"
            >
              <RollingText text={status === "sending" ? "Booking…" : "Confirm booking"} />
              <SwapArrow />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

import { z } from "zod";
import { BOOKING, isBookableStart } from "@/data/booking";
import { isBotSubmission, isRateLimited, renderStudioMail, sendStudioMail } from "@/lib/mail";

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  note: z.string().trim().max(2000).default(""),
  /** Call start, ISO 8601 */
  start: z.iso.datetime(),
  /** The visitor's IANA time zone, to show the time as they saw it */
  timeZone: z.string().trim().max(64).default("UTC"),
  source: z.string().trim().max(80).default("Website"),
  /** Spam trap (checked before parsing) */
  trap: z.string().max(500).optional(),
});

const formatIn = (date: Date, timeZone: string) => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  } catch {
    return date.toISOString();
  }
};

// Calendar invite for the studio inbox (UTC times)
const icsStamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (value: string) => value.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");

function buildInvite(start: Date, end: Date, name: string, email: string, note: string): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Qynesis//Discovery call//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}-${email.replace(/[^a-z0-9]/gi, "")}@qynesis.com`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsText(`Discovery call with ${name}`)}`,
    `DESCRIPTION:${icsText(`Booked from the Qynesis website.\nEmail: ${email}${note ? `\nNote: ${note}` : ""}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export async function POST(request: Request) {
  if (isRateLimited(request, "book-call")) {
    return Response.json({ ok: false, error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (isBotSubmission(body, "book-call")) {
    return Response.json({ ok: true }); // a bot: pretend it worked
  }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Please check your details and try again." }, { status: 400 });
  }
  const data = parsed.data;
  const start = new Date(data.start);
  if (!isBookableStart(start)) {
    return Response.json(
      { ok: false, error: "That time is no longer available. Please pick another slot." },
      { status: 409 },
    );
  }
  const end = new Date(start.getTime() + BOOKING.durationMinutes * 60_000);
  const studioTime = formatIn(start, BOOKING.timeZone);
  const clientTime = formatIn(start, data.timeZone);

  const { html, text } = renderStudioMail(
    "New discovery call booked",
    `${data.name} booked a ${BOOKING.durationMinutes}-minute call from the ${data.source}.`,
    [
      ["Name", data.name],
      ["Email", data.email],
      ["When (studio time)", studioTime],
      ["When (their time)", `${clientTime} · ${data.timeZone}`],
      ["Duration", `${BOOKING.durationMinutes} minutes`],
      ["What they'd like to discuss", data.note],
      ["Booked from", data.source],
    ],
  );

  try {
    await sendStudioMail({
      subject: `Call booked: ${studioTime} — ${data.name}`,
      text,
      html,
      replyTo: data.email,
      attachments: [
        {
          filename: "discovery-call.ics",
          content: buildInvite(start, end, data.name, data.email, data.note),
          contentType: "text/calendar; charset=utf-8",
        },
      ],
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Call booking email failed", err);
    return Response.json(
      { ok: false, error: "We couldn't confirm your booking right now. Please email hello@qynesis.com." },
      { status: 500 },
    );
  }
}

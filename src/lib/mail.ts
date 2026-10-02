// ─── STUDIO MAIL (server only) ─────────────────────────────────────────────
// Sends website enquiries and call bookings to the studio inbox over SMTP.
//
// Configure in .env.local (or the host's environment):
//   SMTP_HOST=smtp.example.com
//   SMTP_PORT=587                 # 587 = STARTTLS (465 = SSL, blocked on some networks)
//   SMTP_USER=hello@qynesis.com
//   SMTP_PASS=your-app-password
//   MAIL_TO=hello@qynesis.com     # optional, defaults to hello@qynesis.com
//   MAIL_FROM="Qynesis Website <hello@qynesis.com>"   # optional
//
// Without SMTP settings, development logs each message to the server console
// instead of sending it; production reports an error.

import nodemailer, { type Transporter } from "nodemailer";

export const STUDIO_INBOX = process.env.MAIL_TO || "hello@qynesis.com";

let transporter: Transporter | null = null;
let transporterConfig = "";

function getTransporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT || 587);
  // Rebuilt when the settings change (env files reload without a restart in dev)
  const config = `${SMTP_HOST}:${port}:${SMTP_USER}:${SMTP_PASS}`;
  if (transporter && config === transporterConfig) return transporter;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    // 465 = TLS from the start; 587 = plain connection upgraded with STARTTLS
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // Fail within seconds (and show the visitor an error) rather than hang
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  transporterConfig = config;
  return transporter;
}

export interface StudioMail {
  subject: string;
  text: string;
  html: string;
  /** The visitor's address, so replying from the inbox goes straight to them */
  replyTo?: string;
  attachments?: { filename: string; content: string; contentType: string }[];
}

/** Sends to the studio inbox. Returns whether it was actually delivered (false = logged in dev). */
export async function sendStudioMail(mail: StudioMail): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `\n[mail] SMTP is not configured, so this was not sent. It would go to ${STUDIO_INBOX}:\n` +
          `Subject: ${mail.subject}\nReply-To: ${mail.replyTo ?? "-"}\n\n${mail.text}\n`,
      );
      return false;
    }
    throw new Error("SMTP is not configured");
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM || `Qynesis Website <${process.env.SMTP_USER}>`,
    to: STUDIO_INBOX,
    ...mail,
  });
  return true;
}

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

/** A plain, readable email: heading, intro line and a label/value table */
export function renderStudioMail(heading: string, intro: string, rows: [string, string][]): { html: string; text: string } {
  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #ececec;color:#777;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #ececec;color:#111;font-size:15px;white-space:pre-wrap;">${escapeHtml(value || "—")}</td>
        </tr>`,
    )
    .join("");
  const html = `
    <div style="background:#f4f4f2;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
        <div style="background:#080808;color:#ffffff;padding:24px 28px;">
          <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9a9a9a;">Qynesis website</div>
          <div style="font-size:22px;margin-top:6px;">${escapeHtml(heading)}</div>
        </div>
        <p style="margin:0;padding:20px 28px 8px;color:#333;font-size:15px;">${escapeHtml(intro)}</p>
        <table style="width:100%;border-collapse:collapse;margin:8px 0 16px;">${htmlRows}</table>
      </div>
    </div>`;
  const text = `${heading}\n${intro}\n\n${rows.map(([label, value]) => `${label}: ${value || "-"}`).join("\n")}`;
  return { html, text };
}

// ── Light abuse protection ───────────────────────────────────────────────────

/**
 * Spam trap: forms carry a hidden "trap" field that people never see but bots
 * fill in. Browser autofill can still copy one of the visitor's own answers
 * (name, email, company…) into it, so a value repeated from another field
 * doesn't count as a bot. Dropped submissions are logged, never silent.
 */
export function isBotSubmission(body: unknown, endpoint: string): boolean {
  if (!body || typeof body !== "object") return false;
  const { trap, ...fields } = body as Record<string, unknown>;
  if (typeof trap !== "string" || !trap.trim()) return false;
  const value = trap.trim().toLowerCase();
  const own = Object.values(fields).map((v) => String(v ?? "").trim().toLowerCase());
  if (own.includes(value)) return false;
  console.warn(`[mail] ${endpoint}: dropped as spam (hidden trap field = ${JSON.stringify(trap.slice(0, 80))})`);
  return true;
}
const recent = new Map<string, number[]>();

/** Allows `limit` requests per `windowMs` per client and endpoint (in-memory, per server instance) */
export function isRateLimited(request: Request, endpoint: string, limit = 8, windowMs = 10 * 60_000): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  recent.set(key, hits);
  return hits.length > limit;
}

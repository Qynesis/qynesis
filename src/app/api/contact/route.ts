import { z } from "zod";
import { BUDGET_OPTIONS, OTHER_SERVICE, SERVICE_OPTIONS } from "@/data/contactOptions";
import { isBotSubmission, isRateLimited, renderStudioMail, sendStudioMail } from "@/lib/mail";

const inquirySchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.email().max(200),
    company: z.string().trim().max(200).default(""),
    service: z.string().refine((value) => SERVICE_OPTIONS.includes(value)),
    otherService: z.string().trim().max(200).default(""),
    budget: z.string().refine((value) => value === "" || BUDGET_OPTIONS.includes(value)).default(""),
    message: z.string().trim().min(10).max(5000),
    /** Where the form was sent from (contact page, hero modal, …) */
    source: z.string().trim().max(80).default("Website"),
    /** Spam trap (checked before parsing) */
    trap: z.string().max(500).optional(),
  })
  .refine((data) => data.service !== OTHER_SERVICE || data.otherService.length >= 2, {
    path: ["otherService"],
  });

export async function POST(request: Request) {
  if (isRateLimited(request, "contact")) {
    return Response.json({ ok: false, error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (isBotSubmission(body, "contact")) {
    return Response.json({ ok: true }); // a bot: pretend it worked
  }
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Please check the form and try again." }, { status: 400 });
  }
  const data = parsed.data;
  const service = data.service === OTHER_SERVICE ? `Other: ${data.otherService}` : data.service;

  const { html, text } = renderStudioMail(
    "New project inquiry",
    `${data.name} sent an inquiry from the ${data.source}.`,
    [
      ["Full name", data.name],
      ["Email", data.email],
      ["Company / website", data.company],
      ["Service", service],
      ["Budget", data.budget],
      ["Message", data.message],
      ["Sent from", data.source],
    ],
  );

  try {
    await sendStudioMail({
      subject: `New inquiry: ${service} — ${data.name}`,
      text,
      html,
      replyTo: data.email,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Contact inquiry email failed", err);
    return Response.json(
      { ok: false, error: "We couldn't send your message right now. Please email hello@qynesis.com." },
      { status: 500 },
    );
  }
}

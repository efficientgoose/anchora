import { render } from "@react-email/render";
import React from "react";
import { Resend } from "resend";
import { Webhook } from "standardwebhooks";
import { AnchoraAuthEmail, emailCopyFor } from "./templates/anchora-auth-email.tsx";

interface HookUser {
  email: string;
  new_email?: string;
  user_metadata?: Record<string, unknown>;
}

interface HookEmailData {
  token?: string;
  token_hash?: string;
  token_new?: string;
  token_hash_new?: string;
  redirect_to?: string;
  email_action_type: string;
  site_url?: string;
}

interface SendEmailHookPayload {
  user: HookUser;
  email_data: HookEmailData;
}

interface EmailDelivery {
  to: string;
  tokenHash: string;
}

function requiredSecret(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

function confirmationUrl(siteUrl: string, tokenHash: string, actionType: string) {
  const url = new URL("/auth/confirm", siteUrl);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", actionType);
  return url.toString();
}

function deliveriesFor(payload: SendEmailHookPayload): EmailDelivery[] {
  const { user, email_data: emailData } = payload;

  if (emailData.email_action_type === "email_change" && user.new_email) {
    if (emailData.token_hash && emailData.token_hash_new) {
      return [
        { to: user.email, tokenHash: emailData.token_hash_new },
        { to: user.new_email, tokenHash: emailData.token_hash },
      ];
    }

    const tokenHash = emailData.token_hash ?? emailData.token_hash_new;
    if (!tokenHash) throw new Error("Email change payload is missing a token hash");
    return [{ to: user.new_email, tokenHash }];
  }

  if (!user.email || !emailData.token_hash) throw new Error("Auth email payload is missing an email or token hash");
  return [{ to: user.email, tokenHash: emailData.token_hash }];
}

function recipientName(user: HookUser) {
  const fullName = user.user_metadata?.full_name;
  return typeof fullName === "string" && fullName.trim() ? fullName.trim() : undefined;
}

function plainTextEmail({ greetingName, intro, actionLabel, actionUrl, securityNote }: { greetingName?: string; intro: string; actionLabel: string; actionUrl: string; securityNote: string }) {
  return [
    greetingName ? `Hi ${greetingName},` : "Hello,",
    "",
    intro,
    "",
    `${actionLabel}: ${actionUrl}`,
    "",
    securityNote,
    "",
    "Anchora",
    "Every student journey, under control.",
  ].filter((line, index, lines) => line !== "" || lines[index - 1] !== "").join("\n");
}

async function sendDelivery({ resend, payload, delivery, siteUrl, from, replyTo }: { resend: Resend; payload: SendEmailHookPayload; delivery: EmailDelivery; siteUrl: string; from: string; replyTo: string }) {
  const actionType = payload.email_data.email_action_type;
  const copy = emailCopyFor(actionType);
  const actionUrl = confirmationUrl(siteUrl, delivery.tokenHash, actionType);
  const greetingName = recipientName(payload.user);
  const element = React.createElement(AnchoraAuthEmail, {
    actionLabel: copy.actionLabel,
    actionUrl,
    greetingName,
    intro: copy.intro,
    preview: copy.preview,
    securityNote: copy.securityNote,
    title: copy.title,
  });
  const html = await render(element);
  const text = plainTextEmail({ greetingName, intro: copy.intro, actionLabel: copy.actionLabel, actionUrl, securityNote: copy.securityNote });

  const { error } = await resend.emails.send({
    from,
    to: [delivery.to],
    replyTo,
    subject: copy.subject,
    html,
    text,
  });

  if (error) throw new Error(`Resend delivery failed: ${error.message}`);
}

async function handleRequest(request: Request) {
  if (request.method !== "POST") return Response.json({ error: { http_code: 405, message: "Method not allowed" } }, { status: 405 });

  const payloadText = await request.text();
  let hookSecret: string;
  try {
    hookSecret = requiredSecret("SEND_EMAIL_HOOK_SECRET").replace(/^v1,whsec_/, "");
  } catch {
    console.error("[send-email] hook secret is not configured");
    return Response.json({ error: { http_code: 500, message: "Authentication email delivery is not configured" } }, { status: 500 });
  }
  let payload: SendEmailHookPayload;

  try {
    payload = new Webhook(hookSecret).verify(payloadText, Object.fromEntries(request.headers)) as SendEmailHookPayload;
  } catch {
    console.error("[send-email] webhook signature verification failed");
    return Response.json({ error: { http_code: 401, message: "Invalid webhook signature" } }, { status: 401 });
  }

  try {
    const siteUrl = requiredSecret("AUTH_SITE_URL");
    const from = requiredSecret("AUTH_EMAIL_FROM");
    const replyTo = requiredSecret("AUTH_EMAIL_REPLY_TO");
    const resend = new Resend(requiredSecret("RESEND_API_KEY"));
    const deliveries = deliveriesFor(payload);

    await Promise.all(deliveries.map((delivery) => sendDelivery({ resend, payload, delivery, siteUrl, from, replyTo })));
    return Response.json({});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email delivery failure";
    console.error("[send-email] delivery failed", { action: payload.email_data?.email_action_type ?? "unknown", message });
    return Response.json({ error: { http_code: 500, message: "Authentication email delivery failed" } }, { status: 500 });
  }
}

const sendEmailFunction = { fetch: handleRequest };

export default sendEmailFunction;

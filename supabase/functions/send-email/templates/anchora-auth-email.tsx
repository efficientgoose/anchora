import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

interface EmailCopy {
  subject: string;
  preview: string;
  title: string;
  intro: string;
  actionLabel: string;
  securityNote: string;
}

const emailCopy: Record<string, EmailCopy> = {
  signup: {
    subject: "Confirm your Anchora account",
    preview: "Confirm your email to open your Anchora workspace.",
    title: "Your workspace is waiting.",
    intro: "Confirm your email address to finish creating your Anchora account and open the student workspace.",
    actionLabel: "Confirm my email",
    securityNote: "Didn't create an Anchora account? Ignore this email.",
  },
  invite: {
    subject: "You are invited to Anchora",
    preview: "Accept your invitation and secure your Anchora account.",
    title: "You have been invited.",
    intro: "Your Anchora workspace is ready. Accept the invitation, then choose a password to secure your account.",
    actionLabel: "Accept invitation",
    securityNote: "If you were not expecting this invitation, you can ignore this email or reply to let us know.",
  },
  recovery: {
    subject: "Reset your Anchora password",
    preview: "Use this secure link to choose a new Anchora password.",
    title: "Reset your password.",
    intro: "We received a request to reset your Anchora password. Use the secure link below to choose a new one.",
    actionLabel: "Reset password",
    securityNote: "If you did not request a password reset, you can safely ignore this email. Your password will not change.",
  },
  magiclink: {
    subject: "Your secure Anchora sign-in link",
    preview: "Use this secure link to sign in to Anchora.",
    title: "Sign in securely.",
    intro: "Use the secure link below to sign in to your Anchora workspace.",
    actionLabel: "Sign in to Anchora",
    securityNote: "If you did not request this sign-in link, you can safely ignore this email.",
  },
  email_change: {
    subject: "Confirm your Anchora email change",
    preview: "Confirm this email address change for your Anchora account.",
    title: "Confirm your new email.",
    intro: "Confirm this email address to complete the requested change on your Anchora account.",
    actionLabel: "Confirm email change",
    securityNote: "If you did not request this change, do not confirm it. Reply to this email so we can help secure your account.",
  },
  reauthentication: {
    subject: "Confirm your Anchora security action",
    preview: "Confirm this security-sensitive action on your Anchora account.",
    title: "Confirm it is you.",
    intro: "Use the secure link below to continue the security-sensitive action on your Anchora account.",
    actionLabel: "Confirm action",
    securityNote: "If you did not request this action, do not continue. Reply to this email so we can help secure your account.",
  },
};

const fallbackCopy: EmailCopy = {
  subject: "Complete your Anchora security action",
  preview: "Complete the requested action on your Anchora account.",
  title: "One secure step remains.",
  intro: "Use the secure link below to complete the requested action on your Anchora account.",
  actionLabel: "Continue securely",
  securityNote: "If you did not request this action, you can safely ignore this email.",
};

export function emailCopyFor(actionType: string) {
  return emailCopy[actionType] ?? fallbackCopy;
}

export interface AnchoraAuthEmailProps {
  preview: string;
  title: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  securityNote: string;
  greetingName?: string;
}

export function AnchoraAuthEmail({ preview, title, intro, actionLabel, actionUrl, securityNote, greetingName }: AnchoraAuthEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brandBar} />
          <Section style={header}>
            <Img src="https://tryanchora.com/anchora-logo.png" width="36" height="36" alt="" style={logo} />
            <Text style={brandName}>Anchora</Text>
          </Section>

          <Section style={content}>
            <Text style={eyebrow}>STUDENT JOURNEY CONTROL TOWER</Text>
            <Heading as="h1" style={heading}>{title}</Heading>
            <Text style={greeting}>{greetingName ? `Hi ${greetingName},` : "Hello,"}</Text>
            <Text style={paragraph}>{intro}</Text>
            <Button href={actionUrl} style={button}>{actionLabel}</Button>

            <Text style={fallbackLabel}>Button not working? Copy this secure link:</Text>
            <Link href={actionUrl} style={fallbackLink}>{actionUrl}</Link>
            <Hr style={rule} />
            <Text style={security}>{securityNote}</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerTitle}>Every student journey, under control.</Text>
            <Text style={footerText}>Anchora · <Link href="https://tryanchora.com" style={footerLink}>tryanchora.com</Link></Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default AnchoraAuthEmail;

const body = { margin: "0", backgroundColor: "#f8fafc", color: "#18181b", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { width: "100%", maxWidth: "600px", margin: "32px auto", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", backgroundColor: "#ffffff" };
const brandBar = { height: "4px", backgroundColor: "#eab308" };
const header = { padding: "24px 36px", borderBottom: "1px solid #f1f5f9" };
const logo = { display: "inline-block", verticalAlign: "middle", objectFit: "contain" as const };
const brandName = { display: "inline-block", margin: "0 0 0 10px", verticalAlign: "middle", color: "#18181b", fontSize: "19px", fontWeight: "700", letterSpacing: "-0.4px" };
const content = { padding: "38px 36px 34px" };
const eyebrow = { margin: "0 0 10px", color: "#a16207", fontSize: "11px", fontWeight: "700", letterSpacing: "1.2px" };
const heading = { margin: "0", color: "#18181b", fontSize: "30px", lineHeight: "1.2", letterSpacing: "-0.8px" };
const greeting = { margin: "26px 0 0", color: "#18181b", fontSize: "15px", lineHeight: "24px" };
const paragraph = { margin: "10px 0 0", color: "#475569", fontSize: "15px", lineHeight: "24px" };
const button = { display: "inline-block", margin: "26px 0 22px", borderRadius: "8px", backgroundColor: "#18181b", color: "#ffffff", fontSize: "14px", fontWeight: "700", lineHeight: "48px", padding: "0 22px", textDecoration: "none" };
const fallbackLabel = { margin: "0 0 6px", color: "#64748b", fontSize: "12px", lineHeight: "18px" };
const fallbackLink = { color: "#475569", fontSize: "12px", lineHeight: "18px", textDecoration: "underline", wordBreak: "break-all" as const };
const rule = { margin: "28px 0 20px", borderColor: "#e2e8f0" };
const security = { margin: "0", color: "#64748b", fontSize: "12px", lineHeight: "19px" };
const footer = { padding: "22px 36px 26px", backgroundColor: "#18181b" };
const footerTitle = { margin: "0", color: "#ffffff", fontSize: "13px", fontWeight: "700", lineHeight: "20px" };
const footerText = { margin: "4px 0 0", color: "#cbd5e1", fontSize: "11px", lineHeight: "18px" };
const footerLink = { color: "#eab308", textDecoration: "none" };

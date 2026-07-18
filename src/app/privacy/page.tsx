import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Anchora handles personal information during early access.",
};

const sections: LegalSection[] = [
  {
    title: "Who this policy covers",
    paragraphs: [
      "This policy explains how Anchora handles personal information when you visit tryanchora.com, create an account, sign in, contact us, or use the early-access workspace.",
      "For this early-access release, Anchora is the name of the product and service. Questions about this policy can be sent to hello@tryanchora.com.",
    ],
  },
  {
    title: "Information we collect",
    items: [
      "Account information, including your name, email address, authentication method, and account identifiers.",
      "When you choose Google sign-in, basic Google profile information such as your name, email address, profile image, and provider identity.",
      "Session and security information, including cookies, sign-in events, IP address, device or browser details, and diagnostic logs used to protect and operate the service.",
      "Messages, feedback, and support information you choose to send us.",
    ],
  },
  {
    title: "How we use information",
    items: [
      "Create and secure your Anchora account and keep you signed in.",
      "Provide, maintain, troubleshoot, and improve the early-access product.",
      "Send essential account messages such as email confirmations and password resets.",
      "Respond to questions, prevent abuse, and understand whether the service is working as intended.",
    ],
  },
  {
    title: "Google sign-in",
    paragraphs: [
      "Google sign-in is used only to authenticate you with Anchora. We request the basic identity, email, and profile permissions needed to create or access your account. Anchora does not request access to Gmail, Google Drive, Calendar, contacts, or other Google product data.",
      "Anchora does not separately store Google access or refresh tokens for use outside the sign-in session. You can manage Anchora's access from your Google Account settings.",
    ],
  },
  {
    title: "Service providers",
    paragraphs: ["We use carefully selected providers to operate Anchora. They process information on our behalf under their own security and privacy commitments."],
    items: [
      "Supabase for authentication and session infrastructure.",
      "Google for optional Google sign-in.",
      "Vercel for application hosting and operational delivery.",
      "Resend for transactional account email delivery.",
      "Cloudflare for domain, DNS, and email-routing infrastructure.",
    ],
  },
  {
    title: "Sharing and sale",
    paragraphs: [
      "We share information only when needed to operate the service, comply with law, protect people or the service, or complete a business transfer with appropriate safeguards. We do not sell personal information or use it for cross-context behavioral advertising.",
    ],
  },
  {
    title: "Cookies and sessions",
    paragraphs: [
      "Anchora uses essential cookies to establish and refresh secure authentication sessions. These cookies are necessary for sign-in and workspace access. We do not currently use third-party advertising cookies.",
    ],
  },
  {
    title: "Retention and security",
    paragraphs: [
      "We retain account and security information for as long as needed to provide the service, protect it, resolve disputes, and meet legal obligations. Retention periods may vary by information type and provider.",
      "We use reasonable technical and organizational safeguards, but no internet service can guarantee absolute security. Please use a strong password and tell us promptly if you believe your account has been compromised.",
    ],
  },
  {
    title: "Your choices and rights",
    paragraphs: [
      "You may ask to access, correct, or delete information associated with your Anchora account, subject to legal and security requirements. You may also disconnect Google sign-in from your Google Account. Send requests to hello@tryanchora.com from the email associated with your account.",
    ],
  },
  {
    title: "Children and real student data",
    paragraphs: [
      "Anchora's early-access workspace is intended for adult testers and consultancy operators, not children. Do not create accounts for minors or enter personal information about students, applicants, or clients during this release.",
    ],
  },
  {
    title: "Changes and contact",
    paragraphs: [
      "We may update this policy as Anchora develops. If a change is material, we will provide a reasonable notice through the service or by email and update the effective date.",
      "Questions or privacy requests can be sent to hello@tryanchora.com.",
    ],
  },
];

export default function Page() {
  return <LegalPage title="Privacy Policy" summary="A plain-language explanation of what Anchora collects, why we use it, and the choices available to you during early access." sections={sections} />;
}

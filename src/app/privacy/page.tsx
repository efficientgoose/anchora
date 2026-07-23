import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Anchora handles limited student and workspace information.",
};

const sections: LegalSection[] = [
  {
    title: "Who this policy covers",
    paragraphs: [
      "This policy explains how Anchora handles personal information when you visit tryanchora.com, create an account, sign in, contact us, or use the Anchora workspace.",
      "Anchora is operated by Ajinkya Kale, Pyramid Urban Homes, Sector 67, Gurugram, Haryana 122018, India. Questions or privacy requests can be sent to hello@tryanchora.com.",
    ],
  },
  {
    title: "Information we collect",
    items: [
      "Account information, including your name, email address, authentication method, and account identifiers.",
      "For the student-planning service, limited adult applicant information: name, email, optional phone number, intake, assignment, journey status, and planning targets.",
      "When you choose Google sign-in, basic Google profile information such as your name, email address, profile image, and provider identity.",
      "Session and security information, including cookies, sign-in events, IP address, device or browser details, and diagnostic logs used to protect and operate the service.",
      "Messages, feedback, and support information you choose to send us.",
    ],
  },
  {
    title: "How we use information",
    items: [
      "Create and secure your Anchora account and keep you signed in.",
      "Provide, maintain, troubleshoot, and improve the service.",
      "Enable the consultancy that introduced the student to plan and coordinate that student’s India-to-Germany application journey.",
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
      "Supabase for authentication and database/data infrastructure.",
      "Google for optional Google sign-in.",
      "Vercel for application hosting, delivery, analytics, and performance monitoring.",
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
      "Archived student records are retained for 90 days and then erased. PII-minimized audit events are retained for 12 months. Account and security information may be retained for as long as needed to provide the service, protect it, resolve disputes, and meet legal obligations.",
      "We use reasonable technical and organizational safeguards, but no internet service can guarantee absolute security. Please use a strong password and tell us promptly if you believe your account has been compromised.",
    ],
  },
  {
    title: "Your choices and requests",
    paragraphs: [
      "Consultancy owners and admins can export student records and request early erasure through the service. Students should normally contact their consultancy first, because the consultancy is responsible for its authority, notices, and instructions for student data. You may also ask to access, correct, or delete information associated with your Anchora account, subject to legal and security requirements.",
    ],
  },
  {
    title: "Student-data limits",
    paragraphs: [
      "The student-planning service is only for adult applicants in India preparing to study in Germany. Do not enter data about minors.",
      "Do not upload or record passport or identity scans, health documents, financial documents, or unrelated sensitive or free-text information. The service is not intended to hold those materials.",
    ],
  },
  {
    title: "Changes and contact",
    paragraphs: [
      "We may update this policy. If a change is material, we will provide reasonable notice through the service or by email and update the effective date.",
      "Questions or privacy requests can be sent to Ajinkya Kale at hello@tryanchora.com. This policy is governed by the laws of India, and the courts in Gurugram, Haryana have competent jurisdiction, subject to applicable law.",
    ],
  },
];

export default function Page() {
  return <LegalPage title="Privacy Policy" summary="A plain-language explanation of the limited information Anchora uses to support adult India-to-Germany student planning." sections={sections} />;
}

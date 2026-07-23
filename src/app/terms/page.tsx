import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms that apply to Anchora's student-planning service.",
};

const sections: LegalSection[] = [
  {
    title: "Accepting these terms",
    paragraphs: [
      "These terms apply when you visit tryanchora.com, create an account, or use the Anchora workspace. By using Anchora, you agree to these terms and acknowledge the Privacy Policy. If you do not agree, do not use the service.",
      "Anchora is operated by Ajinkya Kale, Pyramid Urban Homes, Sector 67, Gurugram, Haryana 122018, India. Contact hello@tryanchora.com with questions.",
    ],
  },
  {
    title: "Eligibility and accounts",
    paragraphs: [
      "You must be legally able to enter into these terms and use Anchora only for lawful business purposes. You are responsible for accurate account information, protecting your credentials, and activity performed through your account.",
      "Tell us at hello@tryanchora.com if you suspect unauthorized access. You may not share an account in a way that defeats security or accountability controls.",
    ],
  },
  {
    title: "Student-planning service",
    paragraphs: [
      "Anchora helps consultancies coordinate the planning journey for adult applicants in India who intend to study in Germany. Features may change, pause, or be removed as the service develops. We may introduce usage limits, maintenance windows, or new requirements.",
      "Anchora does not provide legal, immigration, admissions, financial, or professional advice and does not guarantee an application, visa, admission, or other outcome.",
    ],
  },
  {
    title: "Permitted student information",
    paragraphs: [
      "Use the student workspace only for adult India-to-Germany applicants. You may enter only a student’s name, email, optional phone number, intake, assignment, journey status, and planning targets.",
      "Do not enter information about minors, passport or identity scans, health documents, financial documents, or unrelated sensitive or free-text data. You are responsible for ensuring that you have a lawful basis and appropriate notice for student information you provide.",
    ],
  },
  {
    title: "Acceptable use",
    items: [
      "Do not break the law, infringe rights, impersonate others, or submit information you are not authorized to use.",
      "Do not probe, scan, disrupt, overload, reverse engineer, or bypass Anchora's security or access controls except where law expressly permits it.",
      "Do not distribute malware, automate abusive account creation, scrape the service, or use it to send spam.",
      "Do not resell, sublicense, or provide the service to another organization without our permission.",
    ],
  },
  {
    title: "Third-party services",
    paragraphs: [
      "Anchora relies on third-party services, including Supabase, Google, Vercel, Resend, and Cloudflare. Their availability and separate terms or privacy practices may affect your use of Anchora. We are not responsible for third-party services outside our control.",
    ],
  },
  {
    title: "Ownership and feedback",
    paragraphs: [
      "Anchora and its product design, software, content, and branding remain owned by their respective rights holders. These terms give you a limited, revocable, non-transferable right to use the service; they do not transfer ownership.",
      "If you send feedback, you allow us to use it without restriction or compensation to improve Anchora, provided we do not identify you publicly without permission.",
    ],
  },
  {
    title: "Suspension and termination",
    paragraphs: [
      "You may stop using Anchora at any time. We may restrict or end access when reasonably necessary for security, maintenance, legal compliance, material breach of these terms, or closure of the service. Contact hello@tryanchora.com to request account deletion.",
    ],
  },
  {
    title: "Disclaimers",
    paragraphs: [
      "Anchora is provided on an as-available basis. To the extent permitted by law, we disclaim implied warranties, including merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee uninterrupted availability.",
    ],
  },
  {
    title: "Limits of liability",
    paragraphs: [
      "To the extent permitted by law, Anchora will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, data, goodwill, or business opportunity arising from the early-access service. Rights that cannot legally be limited remain unaffected.",
    ],
  },
  {
    title: "Governing law, changes, and contact",
    paragraphs: [
      "These terms are governed by the laws of India. The competent courts in Gurugram, Haryana have jurisdiction over disputes, subject to applicable law.",
      "We may update these terms. We will provide reasonable notice of material changes and update the effective date. Continuing to use Anchora after the revised terms take effect means you accept them. Questions can be sent to hello@tryanchora.com.",
    ],
  },
];

export default function Page() {
  return <LegalPage title="Terms of Use" summary="The ground rules for using Anchora to coordinate limited adult student-planning information." sections={sections} />;
}

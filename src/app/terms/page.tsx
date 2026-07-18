import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms that apply to Anchora's early-access product.",
};

const sections: LegalSection[] = [
  {
    title: "Accepting these terms",
    paragraphs: [
      "These terms apply when you visit tryanchora.com, create an account, or use the Anchora early-access workspace. By using Anchora, you agree to these terms and the Privacy Policy. If you do not agree, do not use the service.",
    ],
  },
  {
    title: "Eligibility and accounts",
    paragraphs: [
      "You must be legally able to enter into these terms and use Anchora only for lawful evaluation or business purposes. You are responsible for accurate account information, protecting your credentials, and activity performed through your account.",
      "Tell us at hello@tryanchora.com if you suspect unauthorized access. You may not share an account in a way that defeats security or accountability controls.",
    ],
  },
  {
    title: "Early-access service",
    paragraphs: [
      "Anchora is an evolving early-access product. Features may be incomplete, change, pause, or be removed as we learn from testers. We may introduce usage limits, maintenance windows, or new requirements before a broader release.",
      "The current workspace uses synthetic, browser-local student records. It is a product demonstration and must not be treated as a production system of record.",
    ],
  },
  {
    title: "No real student information",
    paragraphs: [
      "Do not enter real personal, educational, immigration, financial, health, identity-document, or other sensitive information about students, applicants, clients, or third parties. You are responsible for removing any real information entered accidentally and notifying us if assistance is needed.",
    ],
  },
  {
    title: "Acceptable use",
    items: [
      "Do not break the law, infringe rights, impersonate others, or submit information you are not authorized to use.",
      "Do not probe, scan, disrupt, overload, reverse engineer, or bypass Anchora's security or access controls except where law expressly permits it.",
      "Do not distribute malware, automate abusive account creation, scrape the service, or use it to send spam.",
      "Do not resell, sublicense, or provide the early-access workspace as a production service to another organization.",
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
      "Anchora and its product design, software, content, and branding remain owned by their respective rights holders. These terms give you a limited, revocable, non-transferable right to use the early-access service; they do not transfer ownership.",
      "If you send feedback, you allow us to use it without restriction or compensation to improve Anchora, provided we do not identify you publicly without permission.",
    ],
  },
  {
    title: "Suspension and termination",
    paragraphs: [
      "You may stop using Anchora at any time. We may restrict or end access when reasonably necessary for security, maintenance, legal compliance, material breach of these terms, or closure of the early-access program. Contact hello@tryanchora.com to request account deletion.",
    ],
  },
  {
    title: "Disclaimers",
    paragraphs: [
      "Anchora is provided on an early-access, as-available basis. To the extent permitted by law, we disclaim implied warranties, including merchantability, fitness for a particular purpose, and non-infringement. Anchora does not provide legal, immigration, admissions, or professional advice, and does not guarantee application outcomes or uninterrupted availability.",
    ],
  },
  {
    title: "Limits of liability",
    paragraphs: [
      "To the extent permitted by law, Anchora will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, data, goodwill, or business opportunity arising from the early-access service. Rights that cannot legally be limited remain unaffected.",
    ],
  },
  {
    title: "Changes and contact",
    paragraphs: [
      "We may update these terms as Anchora develops. We will provide reasonable notice of material changes and update the effective date. Continuing to use Anchora after the revised terms take effect means you accept them.",
      "Questions about these terms can be sent to hello@tryanchora.com.",
    ],
  },
];

export default function Page() {
  return <LegalPage title="Terms of Use" summary="The ground rules for evaluating Anchora responsibly while the product is still in early access." sections={sections} />;
}

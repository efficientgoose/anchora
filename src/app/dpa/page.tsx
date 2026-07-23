import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Data Processing Agreement",
  description: "The agreement for consultancies using Anchora to process limited student data.",
};

const sections: LegalSection[] = [
  {
    title: "Parties and purpose",
    paragraphs: [
      "This Data Processing Agreement (DPA) forms part of the Terms of Use between the consultancy that accepts it (Consultancy) and Ajinkya Kale, operating Anchora, Pyramid Urban Homes, Sector 67, Gurugram, Haryana 122018, India (Anchora). It applies to the limited personal data processed through the Anchora service.",
      "The Consultancy acts as the controller or business customer for student data and is responsible for its authority, notices, and instructions. Anchora processes that data only to provide and support the service, subject to this DPA and the Terms of Use.",
    ],
  },
  {
    title: "Document version and instructions",
    paragraphs: [
      "Version 2026-07-student-data-v1 is effective July 23, 2026. The Consultancy instructs Anchora to host, organize, display, secure, export, archive, and delete the data needed to operate the student-planning workspace, and to take other documented instructions consistent with the service and applicable law.",
      "If Anchora reasonably believes an instruction conflicts with applicable law, it may notify the Consultancy unless the law prevents notice.",
    ],
  },
  {
    title: "Scope and data limits",
    items: [
      "Data subjects: adult applicants in India preparing to study in Germany, and authorized Consultancy users.",
      "Permitted student data: name, email, optional phone number, intake, assignment, journey status, and planning targets.",
      "Purposes: intake planning, assignment, journey coordination, access control, and service support.",
      "Prohibited data: minors’ data; passport or identity scans; health documents; financial documents; and unrelated sensitive or free-text data.",
    ],
  },
  {
    title: "Confidentiality and security",
    paragraphs: [
      "Anchora will limit access to personnel who need it to operate or support the service and who are subject to appropriate confidentiality obligations. Anchora will maintain reasonable technical and organizational measures appropriate to the limited processing described here. No service can guarantee absolute security or uninterrupted availability.",
    ],
  },
  {
    title: "Subprocessors",
    paragraphs: [
      "The Consultancy authorizes Anchora to use subprocessors needed to provide the service. Current providers are Supabase for authentication and database/data infrastructure, Vercel for application hosting, delivery, analytics, and performance monitoring, Resend for transactional email, Cloudflare for domain, DNS, and email-routing infrastructure, and Google only when a user chooses optional Google sign-in.",
      "Anchora will require subprocessors to protect personal data in a manner appropriate to their role. Anchora may replace or add subprocessors as service needs change and will update its public policy or provide reasonable notice where appropriate.",
    ],
  },
  {
    title: "Incidents and cooperation",
    paragraphs: [
      "Anchora will notify the Consultancy without undue delay after becoming aware of a confirmed personal-data incident affecting the service, taking account of the information available and applicable law. Anchora will reasonably cooperate with the Consultancy’s incident response, data-subject requests, and regulatory inquiries relating to Anchora’s processing.",
      "The Consultancy remains responsible for deciding how to respond to students, authorities, or others where it is the controller or business customer.",
    ],
  },
  {
    title: "Access, export, retention, and deletion",
    paragraphs: [
      "Owners and admins can export student records and request early erasure through the service. Archived student records are retained for 90 days and then erased. PII-minimized audit events are retained for 12 months for security and accountability.",
      "At termination or on the Consultancy’s documented request, Anchora will return available data by export or delete it, unless retention is required by law or needed for the stated audit retention period. The Consultancy should export data it needs before access ends.",
    ],
  },
  {
    title: "Information and audit requests",
    paragraphs: [
      "On reasonable written request, Anchora will provide information reasonably necessary to demonstrate its processing obligations under this DPA, taking account of confidentiality, security, and the nature of the service. Any audit or inspection must be reasonable, proportionate, coordinated in advance, and must not compromise other customers’ security or confidentiality.",
    ],
  },
  {
    title: "Liability and terms linkage",
    paragraphs: [
      "This DPA is part of the Terms of Use. The Terms of Use, including their liability limits, disclaimers, governing law, and Gurugram court jurisdiction, apply to this DPA to the extent permitted by law. If this DPA conflicts with the Terms of Use on processing of personal data, this DPA controls for that conflict.",
      "Questions about this DPA can be sent to hello@tryanchora.com.",
    ],
  },
];

export default function Page() {
  return <LegalPage title="Data Processing Agreement" summary="The organization-level agreement for consultancies that use Anchora to process limited adult student-planning information." sections={sections} />;
}

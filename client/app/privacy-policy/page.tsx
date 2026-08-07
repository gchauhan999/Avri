import type { Metadata } from "next";

import LegalDocument, { type LegalClause } from "@/components/ui/LegalDocument";
import PageHero from "@/components/ui/PageHero";
import { company, contact } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${company.name} collects, uses and protects the personal information you share through this website.`,
  path: "/privacy-policy",
});

const clauses: LegalClause[] = [
  {
    heading: "Information we collect",
    paragraphs: [
      "We collect only what we need in order to respond to you and to deliver the services you ask for.",
    ],
    bullets: [
      "Details you submit through our enquiry and quote forms — name, phone number, email address, organisation, site location and the description of your requirement.",
      "If you apply for a job: your name, contact details, current location, employer, experience, notice period, any links you provide, and the CV you upload.",
      "Correspondence you send us by email, phone or WhatsApp.",
      "Basic technical information your browser sends automatically, such as device type and approximate location, used only to keep the site working and secure.",
    ],
  },
  {
    heading: "Job applications",
    paragraphs: [
      "Your CV and application details are used to assess you for the role you applied for, and for other openings we think may suit you. They are seen by our HR team and the manager hiring for that role — nobody else. We do not pass CVs to recruitment agencies or any other third party.",
      "Applications are stored on our own server, not with a third-party service. If you are not successful we keep your details for up to twelve months in case something more suitable comes up, and then delete them along with your CV. You can ask us to delete them sooner at any time, and we will.",
    ],
  },
  {
    heading: "How we use your information",
    bullets: [
      "To respond to your enquiry and prepare a quotation or proposal.",
      "To carry out a site survey and deliver any services you engage us for.",
      "To assess a job application and contact you about it.",
      "To maintain project records, invoices and statutory documentation.",
      "To contact you about an ongoing project or a service you have received.",
    ],
    paragraphs: [
      "We do not use your details for unrelated marketing, and we do not send bulk promotional messages to people who have only made an enquiry.",
    ],
  },
  {
    heading: "Legal basis and consent",
    paragraphs: [
      "By submitting a form on this website you consent to us contacting you about that enquiry. Where we process information to fulfil a contract, meet a statutory obligation, or protect our legitimate business interests, we rely on those grounds instead.",
    ],
  },
  {
    heading: "Sharing your information",
    paragraphs: [
      "We do not sell or rent personal information. We share it only where it is necessary:",
    ],
    bullets: [
      "With our own engineering, execution and accounts staff working on your requirement.",
      "With suppliers or subcontractors, strictly to the extent needed to deliver your project.",
      "With utilities, government departments or statutory authorities where an approval or inspection requires it.",
      "Where we are legally obliged to disclose it.",
    ],
  },
  {
    heading: "Data retention",
    bullets: [
      "Enquiries: kept while the opportunity is live and for a reasonable period afterwards.",
      "Job applications: up to twelve months from the date you applied, unless you ask us to remove them sooner or you join us.",
      "Project, invoicing and statutory records: for the period required under applicable Indian tax and company law.",
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "We apply reasonable technical and organisational measures to protect the information we hold. Uploaded CVs are stored outside the public website and can only be opened by a signed-in member of our HR team; they are never linked publicly or indexed by search engines.",
      "No transmission over the internet can be guaranteed completely secure. Please do not send financial or identity documents — bank details, PAN, Aadhaar — through the website forms. Send those by email or hand them over directly, and only when we have asked for them.",
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "This website does not set advertising or tracking cookies. If analytics or embedded third-party content — such as the Google Maps frame on our contact page — is used, those providers may set their own cookies under their respective privacy policies.",
    ],
  },
  {
    heading: "Your rights",
    bullets: [
      "Ask what personal information we hold about you.",
      "Ask us to correct information that is inaccurate.",
      "Ask us to delete information we no longer need to retain — including your CV and application.",
      "Withdraw consent to further contact at any time.",
    ],
    paragraphs: [
      `To exercise any of these, write to us at ${contact.email} and we will respond within a reasonable period.`,
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. The revised version will be posted on this page with a new revision date.",
    ],
  },
  {
    heading: "Contact us",
    paragraphs: [
      `Questions about this policy can be sent to ${contact.email}, or posted to ${company.legalName}, ${contact.address}.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        breadcrumb="Privacy Policy"
        eyebrow="Legal"
        title="Privacy Policy"
        lead={`How ${company.name} handles the information you share with us.`}
      />

      <LegalDocument
        updated="29 July 2026"
        intro={`This policy explains what personal information ${company.legalName} collects through this website, why we collect it, and what we do with it. It applies to ${company.siteUrl} and to enquiries made through it.`}
        clauses={clauses}
        footer={
          <p className="text-sm leading-relaxed text-ink-600">
            <strong className="font-semibold text-ink-900">
              Please note:
            </strong>{" "}
            this document is a starting template written for a general Indian
            business context. Have it reviewed by a qualified legal adviser and
            adjusted to your actual data practices before you publish the site.
          </p>
        }
      />
    </>
  );
}

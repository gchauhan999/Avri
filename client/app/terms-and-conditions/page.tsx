import type { Metadata } from "next";

import LegalDocument, { type LegalClause } from "@/components/ui/LegalDocument";
import PageHero from "@/components/ui/PageHero";
import { company, contact } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: `Terms governing the use of the ${company.name} website and the basis on which enquiries, quotations and services are provided.`,
  path: "/terms-and-conditions",
});

const clauses: LegalClause[] = [
  {
    heading: "Acceptance of these terms",
    paragraphs: [
      `By accessing or using this website you agree to these terms. If you do not accept them, please do not use the site. These terms govern use of the website only — work we carry out for you is governed by the separate written contract, work order or purchase order agreed between us.`,
    ],
  },
  {
    heading: "About the content on this site",
    paragraphs: [
      "The information published here — including service descriptions, project examples, capacities and figures — is provided for general guidance. It does not constitute technical advice for any specific installation, and it is not an offer capable of acceptance.",
      "Photographs, illustrations and project details may be indicative. Nothing on this site should be relied upon as a warranty of a particular outcome, capacity or price.",
    ],
  },
  {
    heading: "Quotations and proposals",
    bullets: [
      "Any price shown or discussed before a written quotation is indicative only.",
      "Formal quotations are valid for the period stated on the document, and are subject to site survey, confirmation of scope and availability of material.",
      "Scope boundaries, exclusions and assumptions stated in a quotation form part of it.",
      "A contract comes into existence only when we issue a written acceptance or a work order is executed between the parties.",
    ],
  },
  {
    heading: "Intellectual property",
    paragraphs: [
      `All content on this website — text, layout, graphics, illustrations and the ${company.name} name and logo — belongs to ${company.legalName} or its licensors. You may view and print pages for your own reference. You may not reproduce, republish or use the content commercially without our written permission.`,
    ],
  },
  {
    heading: "Acceptable use",
    bullets: [
      "Do not use the site for any unlawful purpose.",
      "Do not attempt to gain unauthorised access to the site or its underlying infrastructure.",
      "Do not submit false information, malicious code, or automated bulk submissions through our forms.",
      "Do not scrape, mirror or systematically extract content from the site.",
    ],
  },
  {
    heading: "Third-party links and embeds",
    paragraphs: [
      "This site may link to, or embed content from, third parties — for example a Google Maps frame or a social media profile. We do not control those services and are not responsible for their content, availability or privacy practices.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "The website is provided on an 'as is' basis. To the fullest extent permitted by law, we exclude liability for any indirect or consequential loss arising from use of, or inability to use, this website, or from reliance on information published on it.",
      "Nothing in these terms limits liability that cannot lawfully be limited, including liability for death or personal injury caused by negligence, or for fraud.",
    ],
  },
  {
    heading: "Statutory compliance of works",
    paragraphs: [
      "All electrical works we execute are carried out in accordance with applicable Indian Standards, the Central Electricity Authority regulations, and the requirements of the relevant licensing authority or utility. Statutory approvals, inspections and energisation timelines are controlled by those authorities and are outside our direct control.",
    ],
  },
  {
    heading: "Warranty and maintenance",
    paragraphs: [
      "Warranty on equipment supplied is limited to the warranty offered by the original manufacturer. Workmanship warranty, if any, is as stated in the applicable contract. Warranty does not cover damage arising from misuse, unauthorised modification, supply abnormalities beyond specified limits, or force majeure events.",
    ],
  },
  {
    heading: "Governing law and jurisdiction",
    paragraphs: [
      "These terms are governed by the laws of India. Subject to any dispute resolution clause in a specific contract between us, the courts at Ghaziabad, Uttar Pradesh shall have jurisdiction.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may revise these terms at any time. The version published on this page at the time you use the site is the version that applies.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      `Questions about these terms can be sent to ${contact.email}, or posted to ${company.legalName}, ${contact.address}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        breadcrumb="Terms & Conditions"
        eyebrow="Legal"
        title="Terms & Conditions"
        lead={`The basis on which this website and our enquiry process are provided.`}
      />

      <LegalDocument
        updated="29 July 2026"
        intro={`These terms apply to your use of ${company.siteUrl} and to enquiries and quotations arising from it. Please read them before using the site.`}
        clauses={clauses}
        footer={
          <p className="text-sm leading-relaxed text-ink-600">
            <strong className="font-semibold text-ink-900">
              Please note:
            </strong>{" "}
            this document is a starting template written for a general Indian
            business context. Have it reviewed by a qualified legal adviser and
            aligned with your standard contract terms before you publish the
            site.
          </p>
        }
      />
    </>
  );
}

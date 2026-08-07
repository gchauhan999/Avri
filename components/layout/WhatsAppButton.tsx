"use client";

import { motion } from "framer-motion";
import { WhatsApp } from "@/components/ui/Icons";
import { company, whatsappHref } from "@/lib/site";

/**
 * Floating WhatsApp button. Renders nothing when NEXT_PUBLIC_WHATSAPP is unset,
 * so the button never links to a dead number.
 */
export default function WhatsAppButton() {
  if (!whatsappHref) return null;

  const message = encodeURIComponent(
    `Hello ${company.name}, I would like to enquire about your services.`
  );

  return (
    <motion.a
      href={`${whatsappHref}?text=${message}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.1, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ y: -3 }}
      className="group fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full bg-[#25D366] py-3 pl-3.5 pr-4 text-white shadow-lg shadow-[#25D366]/35"
    >
      {/* Gentle attention pulse */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.6s]"
      />
      <WhatsApp />
      <span className="hidden text-sm font-semibold sm:inline">
        Chat on WhatsApp
      </span>
    </motion.a>
  );
}

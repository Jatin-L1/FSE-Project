"use client";

import { useState, useId } from "react";

const FAQS = [
  {
    q: "How do credits work?",
    a: "Each AI generation costs credits from your monthly allowance. Generating an image ad costs 1 credit; a short video ad (up to 15 seconds) costs 2 credits. Credits refresh on your billing renewal date each month — unused credits do not carry over.",
  },
  {
    q: "Can I roll over unused credits to next month?",
    a: "Not currently. Credits reset on your monthly renewal date. If you consistently run out before month end, upgrading to the next tier is usually the most cost-effective move. Team plans can negotiate credit banking on custom contracts.",
  },
  {
    q: "What happens if I hit my credit limit?",
    a: "Your generation queue pauses. You'll see a clear in-app notification with options to wait for renewal, upgrade your plan, or purchase a one-time top-up (coming soon). We never auto-charge beyond your plan — you're always in control.",
  },
  {
    q: "How does Team billing work?",
    a: "Team plans are billed per seat plus a base platform fee. All seats share a single pooled credits balance. Admins can set per-seat caps and track usage by user in the admin dashboard. Invoices are issued monthly or annually.",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 7-day money-back guarantee on your first paid plan purchase. If you're not satisfied within 7 days of your initial upgrade, contact support and we'll refund the full amount — no questions asked. Subsequent billing periods are non-refundable but can be cancelled to prevent future charges.",
  },
  {
    q: "Do you offer Enterprise or custom plans?",
    a: "Yes. If you need 200+ credits per month, SSO/SAML, a dedicated account manager, custom SLAs, or a custom contract, reach out via the contact page. We typically respond within 1 business day.",
  },
] as const;

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const uid = useId();

  function toggle(i: number) {
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  function handleKey(e: React.KeyboardEvent, i: number) {
    const total = FAQS.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      document.getElementById(`faq-btn-${uid}-${(i + 1) % total}`)?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      document.getElementById(`faq-btn-${uid}-${(i - 1 + total) % total}`)?.focus();
    }
    if (e.key === "Home") {
      e.preventDefault();
      document.getElementById(`faq-btn-${uid}-0`)?.focus();
    }
    if (e.key === "End") {
      e.preventDefault();
      document.getElementById(`faq-btn-${uid}-${total - 1}`)?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-3" role="list" aria-label="Frequently asked questions">
      {FAQS.map((faq, i) => {
        const isOpen = openIndex === i;
        const btnId = `faq-btn-${uid}-${i}`;
        const panelId = `faq-panel-${uid}-${i}`;

        return (
          <div
            key={i}
            role="listitem"
            className={`rounded-xl border transition-all duration-300 overflow-hidden
              ${isOpen
                ? "border-accent-purple/30 bg-accent-purple/10 shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                : "border-border bg-surface-light/30 hover:border-accent-purple/30"
              }`}
          >
            <button
              id={btnId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(i)}
              onKeyDown={(e) => handleKey(e, i)}
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4
                         text-sm font-semibold text-text-primary
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-inset
                         hover:text-accent-purple transition-colors duration-300"
            >
              <span>{faq.q}</span>
              <svg
                aria-hidden="true"
                className={`flex-shrink-0 w-4 h-4 text-white/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* CSS max-height transition for smooth open/close */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={`overflow-hidden transition-all duration-300 ease-in-out
                ${isOpen ? "max-h-60" : "max-h-0"}`}
            >
              <p className="px-5 pb-5 pt-1 text-sm leading-relaxed text-white/50">
                {faq.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

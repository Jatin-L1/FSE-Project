"use client";

import { useState } from "react";
import PricingCard, { type Plan } from "@/components/pricing/PricingCard";
import PricingFAQ from "@/components/pricing/PricingFAQ";
import ComparisonTable from "@/components/pricing/ComparisonTable";

// Plan data
const PLANS: Plan[] = [
  {
    slug: "free",
    title: "Free",
    tagline: "Try before you commit",
    priceMonthly: 0,
    priceYearly: 0,
    creditLabel: "5 credits / month",
    popular: false,
    ctaLabel: "Start Free",
    features: [
      { text: "5 AI-generated ads / month",          included: true  },
      { text: "Basic style presets (6)",              included: true  },
      { text: "Image ads (1 credit each)",            included: true  },
      { text: "Community sharing (watermarked)",      included: true  },
      { text: "Short video ads (2 credits)",          included: false },
      { text: "Priority generation queue",            included: false },
      { text: "Product photo uploads",                included: false },
      { text: "Commercial license",                   included: false },
    ],
  },
  {
    slug: "creator",
    title: "Creator",
    tagline: "For solo marketers & creators",
    priceMonthly: 12,
    priceYearly: 10,
    creditLabel: "40 credits / month",
    popular: false,
    ctaLabel: "Get Creator",
    features: [
      { text: "40 AI-generated ads / month",          included: true  },
      { text: "Full style presets (40+)",              included: true  },
      { text: "Image & video ads",                    included: true  },
      { text: "Community sharing (no watermark)",     included: true  },
      { text: "Priority generation queue",            included: true  },
      { text: "Product photo uploads (5 / month)",   included: true  },
      { text: "Aspect ratio selector",                included: true  },
      { text: "Commercial license",                   included: false },
    ],
  },
  {
    slug: "pro",
    title: "Pro",
    tagline: "For serious advertisers",
    priceMonthly: 29,
    priceYearly: 24,
    creditLabel: "120 credits / month",
    popular: true,
    ctaLabel: "Go Pro",
    features: [
      { text: "120 AI-generated ads / month",         included: true  },
      { text: "Full style presets (40+)",              included: true  },
      { text: "Image & video ads",                    included: true  },
      { text: "Private workspace + community feed",   included: true  },
      { text: "Fastest generation queue",             included: true  },
      { text: "Unlimited product photo uploads",      included: true  },
      { text: "All aspect ratios + custom crop",      included: true  },
      { text: "Commercial license",                   included: true  },
    ],
  },
  {
    slug: "team",
    title: "Team",
    tagline: "Scale with your whole team",
    priceMonthly: null,
    priceYearly: null,
    creditLabel: "Shared credits pool",
    popular: false,
    ctaLabel: "Contact Sales",
    features: [
      { text: "Everything in Pro",                    included: true  },
      { text: "Multi-seat billing",                   included: true  },
      { text: "Shared credits pool across seats",     included: true  },
      { text: "Admin dashboard & usage analytics",    included: true  },
      { text: "Priority support (Slack)",             included: true  },
      { text: "Custom brand kit",                     included: true  },
      { text: "SSO / SAML (add-on)",                  included: true  },
      { text: "Custom contract & invoicing",          included: true  },
    ],
  },
];

// Main Component
export default function PricingClient() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-text-primary">
      <div className="flex flex-col">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section
          role="region"
          aria-label="Pricing hero"
          className="relative px-4 pt-28 pb-16 text-center overflow-hidden"
        >
          {/* Background glow blobs */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-purple/20 rounded-full blur-[150px]" />
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent-indigo/10 rounded-full blur-[150px]" />
          </div>

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-accent-purple/10 border border-accent-purple/20 text-accent-purple
                          text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" aria-hidden="true" />
            No credit card required to start
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5 max-w-3xl mx-auto">
            Ads That Convert.{" "}
            <span className="bg-gradient-to-r from-accent-purple to-accent-indigo bg-clip-text text-transparent">
              Pricing That Makes Sense.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            Generate stunning image and video ads with AI in seconds — not hours.
            Simple credit model, no hidden fees.
          </p>

          {/* Supporting bullets */}
          <ul
            className="flex flex-wrap justify-center gap-3 mb-12"
            aria-label="Key benefits"
          >
            {[
              { icon: "⚡", label: "10-second generation" },
              { icon: "🎨", label: "40+ style presets" },
              { icon: "💳", label: "Transparent credit model" },
            ].map(({ icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                           bg-white/5 border border-white/10 text-white/70"
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </li>
            ))}
          </ul>

          {/* Hero CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/signup"
              className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white
                         bg-gradient-to-r from-accent-purple to-accent-indigo
                         hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:-translate-y-0.5
                         transition-all duration-300
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
              aria-label="Create a free account — no credit card required"
            >
              Start Free →
            </a>
            <a
              href="#comparison"
              className="px-8 py-3.5 rounded-xl font-semibold text-sm text-text-secondary
                         bg-surface-light/50 border border-border
                         hover:border-accent-purple/50 hover:text-white
                         transition-all duration-300
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/50"
              aria-label="Scroll to feature comparison table"
            >
              Compare Plans
            </a>
          </div>
        </section>

        {/* ── Billing Toggle ───────────────────────────────────────────── */}
        <section
          role="region"
          aria-label="Billing period selector"
          className="flex justify-center mb-4 px-4"
        >
          <div className="inline-flex p-1 rounded-2xl bg-surface-light/50 border border-border">
            <button
              type="button"
              onClick={() => setYearly(false)}
              aria-pressed={!yearly}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple
                ${!yearly
                  ? "bg-accent-purple/20 text-accent-purple shadow-sm"
                  : "text-text-muted hover:text-text-primary"
                }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              aria-pressed={yearly}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple
                ${yearly
                  ? "bg-accent-purple/20 text-accent-purple shadow-sm"
                  : "text-text-muted hover:text-text-primary"
                }`}
            >
              Yearly
              <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent-gold/15 text-accent-gold">
                Save 17%
              </span>
            </button>
          </div>
        </section>

        {/* Credit model micro-copy */}
        <p className="text-center text-xs text-white/25 mb-10 px-4" role="note">
          Image = 1 credit &bull; Short Video = 2 credits &bull; Unused monthly credits do not roll over
        </p>

        {/* ── Pricing Cards ────────────────────────────────────────────── */}
        <section
          role="region"
          aria-label="Pricing plans"
          className="px-4 pb-20 max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
            {PLANS.map((plan) => (
              <PricingCard key={plan.slug} plan={plan} yearly={yearly} />
            ))}
          </div>

          {/* Legal microcopy */}
          <p className="text-center text-xs text-white/20 mt-8 max-w-md mx-auto">
            All prices in USD. Yearly plans billed annually.{" "}
            <a href="/legal/refunds" className="underline underline-offset-2 hover:text-white/40 transition-colors">
              Refund policy
            </a>{" "}
            ·{" "}
            <a href="/legal/terms" className="underline underline-offset-2 hover:text-white/40 transition-colors">
              Terms of service
            </a>
          </p>
        </section>

        {/* ── Comparison Table ─────────────────────────────────────────── */}
        <section
          id="comparison"
          role="region"
          aria-label="Feature comparison table"
          className="px-4 pb-20 max-w-5xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Everything, compared
          </h2>
          <p className="text-center text-white/40 mb-8 text-sm">
            Every feature and limit, side by side.
          </p>
          <ComparisonTable />
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section
          role="region"
          aria-label="Frequently asked questions"
          className="px-4 pb-20 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Questions, answered
          </h2>
          <p className="text-center text-white/40 mb-8 text-sm">
            Still unsure? We've got you.
          </p>
          <PricingFAQ />
        </section>

        {/* ── Bottom CTA Banner ────────────────────────────────────────── */}
        <section
          role="region"
          aria-label="Get started"
          className="mx-4 mb-16 max-w-4xl xl:mx-auto rounded-3xl p-10 sm:p-16 text-center
                     bg-gradient-to-br from-accent-purple/10 to-accent-indigo/5
                     border border-accent-purple/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-[100px] pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Your first 5 ads are on us.
          </h2>
          <p className="text-white/50 mb-8 text-base max-w-md mx-auto leading-relaxed">
            No credit card. No commitment. Sign up and start generating — upgrade the moment you're ready to scale.
          </p>
          <a
            href="/signup?ref=pricing-bottom"
            className="inline-block px-10 py-4 rounded-xl font-bold text-sm text-white
                       bg-gradient-to-r from-accent-purple to-accent-indigo
                       hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:-translate-y-0.5
                       transition-all duration-300
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
            aria-label="Create a free account"
          >
            Create Free Account →
          </a>
          <p className="text-xs text-white/20 mt-4">
            Accepts card · PhonePe · UPI &nbsp;·&nbsp; Cancel anytime
          </p>
        </section>
      </div>
    </div>
  );
}

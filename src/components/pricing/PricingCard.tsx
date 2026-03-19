"use client";

import { useRouter } from "next/navigation";

// Types
export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  slug: string;
  title: string;
  tagline: string;
  priceMonthly: number | null;   // null → custom / contact sales
  priceYearly: number | null;
  creditLabel: string;
  features: PlanFeature[];
  popular: boolean;
  ctaLabel: string;
}

interface PricingCardProps {
  plan: Plan;
  yearly: boolean;
}

// Savings % helper
function savingsPct(monthly: number, yearly: number): number {
  return Math.round(((monthly - yearly) / monthly) * 100);
}

// Component
export default function PricingCard({ plan, yearly }: PricingCardProps) {
  const router = useRouter();

  const price = yearly ? plan.priceYearly : plan.priceMonthly;
  const hasSavings =
    yearly &&
    plan.priceMonthly !== null &&
    plan.priceYearly !== null &&
    plan.priceMonthly > 0;

  function handleCta() {
    if (plan.slug === "free") {
      router.push("/signup");
      return;
    }
    if (plan.slug === "team") {
      router.push("/contact?ref=pricing");
      return;
    }
    const billing = yearly ? "yearly" : "monthly";
    // Wires into the existing /api/payment/checkout route
    // The payment/callback page already exists in this project.
    router.push(`/api/payment/checkout?plan=${plan.slug}&billing=${billing}`);
  }

  return (
    <article
      aria-label={`${plan.title} plan`}
      className={`
        relative flex flex-col rounded-2xl p-6 transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl focus-within:ring-2 focus-within:ring-purple-500
        ${plan.popular
          ? "bg-gradient-to-b from-accent-purple/20 to-accent-indigo/10 border-2 border-accent-purple/50 shadow-lg shadow-accent-purple/10"
          : "bg-surface-light/30 border border-border hover:border-accent-purple/40"
        }
      `}
    >
      {/* Most Popular badge */}
      {plan.popular && (
        <div
          aria-label="Most popular plan"
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap
                     bg-gradient-to-r from-accent-purple to-accent-indigo
                     text-white text-[11px] font-bold tracking-widest
                     px-4 py-1 rounded-full shadow-md shadow-accent-purple/20"
        >
          ✦ MOST POPULAR
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">{plan.title}</h2>
        <p className="text-xs text-white/50 mt-0.5">{plan.tagline}</p>
      </div>

      {/* Price */}
      <div
        className="mb-4"
        aria-label={
          price === null
            ? "Custom pricing"
            : `$${price} per month`
        }
      >
        {price === null ? (
          <p className="text-4xl font-extrabold text-white">Custom</p>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-4xl font-extrabold text-white">${price}</span>
            <span className="text-sm text-white/40 mb-1.5">/ mo</span>
            {hasSavings && plan.priceMonthly && plan.priceYearly && (
              <span className="ml-2 mb-1.5 text-xs font-bold px-2 py-0.5 rounded-full bg-accent-gold/15 text-accent-gold">
                −{savingsPct(plan.priceMonthly, plan.priceYearly)}%
              </span>
            )}
          </div>
        )}
        {yearly && plan.priceYearly && plan.priceYearly > 0 && (
          <p className="text-xs text-white/40 mt-1">
            Billed ${plan.priceYearly * 12} / year
          </p>
        )}
        {plan.slug === "team" && (
          <p className="text-xs text-white/40 mt-1">Per seat · custom quote</p>
        )}
      </div>

      {/* Credit label chip */}
      <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-white/60">
        <span aria-hidden="true">🪙</span>
        {plan.creditLabel}
      </div>

      {/* CTA Button */}
      <button
        type="button"
        onClick={handleCta}
        aria-label={`${plan.ctaLabel} — ${plan.title} plan`}
        className={`
          w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2
          active:scale-95
          ${plan.popular
            ? "bg-gradient-to-r from-accent-purple to-accent-indigo text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:-translate-y-0.5"
            : plan.slug === "creator"
            ? "bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/30 hover:bg-accent-indigo/20"
            : "bg-surface-light border border-border hover:border-accent-purple/50 hover:text-white text-text-muted"
          }
        `}
      >
        {plan.ctaLabel}
      </button>

      {/* Divider */}
      <hr className="my-5 border-white/10" aria-hidden="true" />

      {/* Features */}
      <ul
        className="flex flex-col gap-2.5 flex-1"
        aria-label={`${plan.title} plan features`}
      >
        {plan.features.map((feat) => (
          <li
            key={feat.text}
            className={`flex items-start gap-2.5 text-xs leading-relaxed ${
              feat.included ? "text-white/80" : "text-white/25"
            }`}
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 flex-shrink-0 ${
                feat.included
                  ? plan.popular
                    ? "text-accent-purple"
                    : "text-accent-gold"
                  : "text-white/20"
              }`}
            >
              {feat.included ? (
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8l3.5 3.5L13 4.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 8h8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
            <span>{feat.text}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

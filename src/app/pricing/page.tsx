import type { Metadata } from "next";
import Script from "next/script";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing — AI Ads Generator",
  description:
    "Simple, transparent pricing for AI-powered ad creation. Generate image and video ads with credits. Start free — no credit card required.",
  openGraph: {
    title: "Pricing — AI Ads Generator",
    description: "Generate stunning image & video ads with AI. Free plan available.",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "AI Ads Generator",
  description: "AI-powered tool to generate image and video advertisements.",
  offers: [
    { "@type": "Offer", name: "Creator", price: 12,  priceCurrency: "USD", availability: "https://schema.org/InStock" },
    { "@type": "Offer", name: "Pro",     price: 29,  priceCurrency: "USD", availability: "https://schema.org/InStock" },
  ],
};

export default function PricingPage() {
  return (
    <>
      <Script id="pricing-schema" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

      <PricingClient />
    </>
  );
}

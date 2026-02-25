import { HeroCanvas } from "@/components/hero/HeroCanvas";
import { HeroOverlay } from "@/components/hero/HeroOverlay";
import { ParticleField } from "@/components/hero/ParticleField";
import { GlassPanels } from "@/components/hero/GlassPanel";
import { FeaturesCanvas } from "@/components/features/FeaturesCanvas";

export default function HomePage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative">
                <HeroCanvas />
                <ParticleField />
                <GlassPanels />
                <HeroOverlay />
            </section>

            {/* Seamless transition zone */}
            <div className="relative z-10 -mt-[1px]">
                <div className="h-1 bg-background" />
            </div>

            {/* Features Section — Scroll-Driven 3D Animation */}
            <FeaturesCanvas />

            {/* CTA Section */}
            <section className="relative py-32 px-6 overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-gold/5 rounded-full blur-[150px] pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-gradient mb-6">
                        Ready to Create?
                    </h2>
                    <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join thousands of creators and brands using AI to generate
                        high-converting video ads in seconds.
                    </p>

                    <div className="inline-flex items-center gap-4">
                        <a
                            href="/generator"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-purple to-accent-indigo text-white font-medium rounded-xl hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all duration-300 text-lg"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Start Generating
                        </a>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-16 flex items-center justify-center gap-8 text-text-muted text-sm">
                        <span>✓ No credit card required</span>
                        <span>✓ 5 free ads</span>
                        <span>✓ Cancel anytime</span>
                    </div>
                </div>
            </section>
        </>
    );
}

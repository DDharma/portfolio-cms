import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { SectionShell } from "@/components/sections/section-shell";
import { sanitizeHTML } from "@/lib/utils/html-sanitizer";
import { cn } from "@/lib/utils";

// Helper to unescape HTML entities (server-safe, no DOM)
const unescapeHTML = (html: string): string => {
  if (!html) return ''
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&apos;/g, "'")
}

type HeroSectionProps = {
  data?: any;
};

export const HeroSection = ({ data }: HeroSectionProps) => {
  if (!data) return null;
  const heroContent = data;

  // Sanitize HTML from title (render database content if available)
  const sanitizedTitle = heroContent.title
    ? sanitizeHTML(unescapeHTML(heroContent.title))
    : '';

  return (
    <SectionShell id="hero" className="pt-28 md:pt-36 lg:pt-44">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-zinc-500">
          {heroContent.subtitle}
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.02em] text-white md:text-4xl lg:text-5xl leading-[1.15]">
          {sanitizedTitle && (
            <span dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />
          )}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-zinc-400 max-w-2xl">
          {typeof heroContent.description === 'string' && heroContent.description.includes('<') ? (
            <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(unescapeHTML(heroContent.description)) }} />
          ) : (
            heroContent.description
          )}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row flex-wrap">
          {(heroContent.hero_ctas || []).map((cta: any) => (
            <Link
              key={cta.label}
              target={cta.label.toLowerCase().includes('resume') ? '_blank' : undefined}
              rel={cta.label.toLowerCase().includes('resume') ? 'noopener noreferrer' : undefined}
              href={cta.href}
              className={cn(
                buttonVariants({
                  variant: cta.variant === "ghost" ? "ghost" : "ghost",
                  size: "lg",
                }),
                "gap-1 border-0"
              )}
            >
              <span className="gradient-text">{cta.label}</span>
              <ArrowUpRight className="h-4 w-4 gradient-icon" />
            </Link>
          ))}

        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 border-t border-white/[0.06] pt-8 sm:grid-cols-3">
        {(heroContent.hero_stats || []).map((stat: any) => (
          <div key={stat.label}>
            <p className="text-3xl font-medium text-white">{stat.value}</p>
            <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
};

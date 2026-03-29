import { SectionShell } from "@/components/sections/section-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { sanitizeHTML } from "@/lib/utils/html-sanitizer";

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

type AboutSectionProps = {
  data?: any;
};

export const AboutSection = ({ data }: AboutSectionProps) => {
  if (!data) return null;

  const highlights = data.about_highlights || [];
  const principles = data.about_principles || [];

  // Unescape and sanitize HTML from database content
  const title = data.title
    ? sanitizeHTML(unescapeHTML(data.title))
    : '';
  const description = data.description
    ? sanitizeHTML(unescapeHTML(data.description))
    : '';

  return (
    <SectionShell id="about" className="relative">
      <SectionHeading
        heading="About"
        title={title}
        description={description}
        titleIsHtml={true}
        descriptionIsHtml={true}
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-6">
        {highlights.map((item: any) => {
          const highlightTitle = item.title ? sanitizeHTML(unescapeHTML(item.title)) : '';
          const highlightDesc = item.description ? sanitizeHTML(unescapeHTML(item.description)) : '';

          return (
            <article
              key={item.title}
              className="group rounded-2xl border border-white/[0.06] bg-zinc-950 p-5 transition-colors duration-300 hover:border-white/[0.1]"
            >
              <div className="h-px w-10 bg-gradient-to-r from-indigo-500/60 to-sky-500/40" />
              <h3 className="mt-5 text-lg font-medium text-white">
                {highlightTitle.includes('<') ? (
                  <span dangerouslySetInnerHTML={{ __html: highlightTitle }} />
                ) : (
                  highlightTitle
                )}
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                {highlightDesc.includes('<') ? (
                  <span dangerouslySetInnerHTML={{ __html: highlightDesc }} />
                ) : (
                  highlightDesc
                )}
              </p>
            </article>
          );
        })}
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        {principles.map((principle: any) => (
          <div
            key={principle.title}
            className="flex flex-col rounded-xl border border-white/[0.04] px-4 py-3"
          >
            <span className="text-sm text-white">{principle.title}</span>
            <span className="text-xs text-zinc-500">{principle.description}</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
};

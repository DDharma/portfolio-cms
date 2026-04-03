import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";

import { SectionShell } from "@/components/sections/section-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { getBlogPosts } from "@/lib/api/blog";
import { getSiteSettings, DEFAULT_SITE_NAME } from "@/lib/api/contact";
import { Badge } from "@/components/ui/badge";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings?.site_name ?? DEFAULT_SITE_NAME;
  return {
    title: `Blog · ${name}`,
    description: "Writing on engineering, design systems, and product development.",
  };
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <SectionShell id="blog-page">
      <SectionHeading
        heading="Writing"
        title="Notes from the craft desk."
        description="Deep dives on design systems, motion heuristics, and product engineering rituals."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {blogPosts && blogPosts.length > 0 ? (
          blogPosts.map((post) => (
            <article
              key={post.slug}
              className="group relative rounded-2xl border border-black overflow-hidden transition-colors duration-300 hover:border-white/[0.1]"
              style={{
                backgroundImage: post.featured_image ? `url('${post.featured_image}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent rounded-2xl" />

              <Link href={`/blog/${post.slug}`} className="relative block p-5 lg:p-6">
                {/* Meta row: date · reading time */}
                <div className="flex items-center gap-3 text-xs text-black">
                  {post.created_at && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                  )}
                  {post.reading_time && (
                    <>
                      <span className="h-0.5 w-0.5 rounded-full bg-zinc-600" />
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{post.reading_time}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Title row with animated arrow */}
                <div className="mt-3 flex items-start justify-between gap-4">
                  <h3 className="text-xl font-medium tracking-[-0.01em] text-white transition-colors">
                    {post.title}
                  </h3>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-zinc-600 transition-all duration-200 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

                {/* Description */}
                <div
                  className="mt-2.5 text-sm leading-relaxed text-zinc-400 prose prose-invert prose-sm max-w-none [&_p]:m-0 [&_strong]:font-semibold [&_em]:italic line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: post.description }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag.id || tag.tag} variant="outline">{tag.tag}</Badge>
                    ))}
                  </div>
                )}
              </Link>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-12 text-center">
            <p className="text-zinc-400">No blog posts published yet</p>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

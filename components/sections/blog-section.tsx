import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";

import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BlogPost = {
  slug: string;
  title: string;
  description?: string | null;
  featured_image?: string | null;
  created_at?: string | null;
  reading_time?: string | null;
  blog_post_tags?: Array<{ id?: string; tag: string }> | null;
};

type BlogSectionProps = {
  posts?: BlogPost[];
};

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

const FeaturedCard = ({ post }: { post: BlogPost }) => {
  const date = formatDate(post.created_at);
  const tags = post.blog_post_tags ?? [];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950 transition-colors duration-300 hover:border-white/[0.1]"
    >
      <div
        className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-zinc-900"
        style={
          post.featured_image
            ? {
                backgroundImage: `url('${post.featured_image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 lg:p-6">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {date}
            </span>
          )}
          {post.reading_time && (
            <>
              <span className="h-0.5 w-0.5 rounded-full bg-zinc-600" />
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.reading_time}
              </span>
            </>
          )}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-medium tracking-[-0.01em] text-white transition-colors group-hover:text-zinc-200 md:text-2xl">
            {post.title}
          </h3>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-zinc-600 transition-all duration-200 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        {post.description && (
          <div
            className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed text-zinc-400 line-clamp-3 [&_p]:m-0 [&_strong]:font-semibold [&_em]:italic"
            dangerouslySetInnerHTML={{ __html: post.description }}
          />
        )}
        {tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id ?? tag.tag} variant="outline">
                {tag.tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

const SmallCard = ({ post }: { post: BlogPost }) => {
  const date = formatDate(post.created_at);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-4 rounded-2xl border border-white/[0.06] bg-zinc-950 p-4 transition-colors duration-300 hover:border-white/[0.1]"
    >
      <div
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-zinc-900"
        style={
          post.featured_image
            ? {
                backgroundImage: `url('${post.featured_image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {date}
            </span>
          )}
          {post.reading_time && (
            <>
              <span className="h-0.5 w-0.5 rounded-full bg-zinc-600" />
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {post.reading_time}
              </span>
            </>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm font-medium text-white transition-colors group-hover:text-zinc-300 md:text-base">
          {post.title}
        </h3>
      </div>
    </Link>
  );
};

export const BlogSection = ({ posts }: BlogSectionProps) => {
  if (!posts || posts.length === 0) return null;

  const [featured, ...rest] = posts;
  const small = rest.slice(0, 3);

  return (
    <SectionShell id="blog">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          heading="Writing"
          title="Notes from the craft desk."
          description="Recent posts on frontend engineering, AI integration, design systems, and product development."
        />
        <Link
          href="/blog"
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "self-start md:self-auto shrink-0"
          )}
        >
          View all posts
        </Link>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-6">
        <FeaturedCard post={featured} />
        {small.length > 0 && (
          <div className="flex flex-col gap-4 lg:gap-5">
            {small.map((post) => (
              <SmallCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
};

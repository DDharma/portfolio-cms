"use client";

import {
  Sparkles,
  Layers,
  Server,
  Bot,
  Cloud as CloudIcon,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { SectionShell } from "@/components/sections/section-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { IconName } from "@/utils/data";

const iconMap: Record<IconName, LucideIcon> = {
  Sparkles,
  Layers,
  Server,
  Bot,
  Cloud: CloudIcon,
};


const VISIBLE_TOOLS_COUNT = 4;

const SkillCard = ({ skill }: { skill: any }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[skill.icon as IconName] || Sparkles;
  const hasMore = skill.tools.length > VISIBLE_TOOLS_COUNT;
  const visibleTools = expanded
    ? skill.tools
    : skill.tools.slice(0, VISIBLE_TOOLS_COUNT);

  return (
    <Card className="group flex h-full flex-col justify-between p-5">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-500/10 p-2.5">
            <Icon className="h-5 w-5 text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium text-white">{skill.title}</h3>
        </div>
        <p className="mt-3 text-sm text-zinc-400">{skill.description}</p>
      </div>
      <div className="mt-5">
        <div className="flex flex-wrap gap-2">
          {visibleTools.map((tool: any) => (
            <Badge key={tool} variant="outline">
              {tool}
            </Badge>
          ))}
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
            {expanded
              ? "Show less"
              : `Show all ${skill.tools.length} tools`}
          </button>
        )}
      </div>
    </Card>
  );
};

type SkillsSectionProps = {
  data?: any[];
  sectionHeading?: { heading: string; title: string; description?: string } | null;
};

export const SkillsSection = ({ data, sectionHeading }: SkillsSectionProps) => {
  if (!data || data.length === 0) return null;
  const categories = data;

  console.log("cat",categories);


  return (
    <SectionShell id="skills">
      <SectionHeading
        heading={sectionHeading?.heading ?? 'Capabilities'}
        title={sectionHeading?.title ?? 'Crafted systems with engineering-grade polish.'}
        description={sectionHeading?.description ?? 'A multidisciplinary toolkit for building expressive, reliable products end-to-end.'}
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {categories.map((skill: any) => {
          // Transform database data to match component expectations
          const transformedSkill = {
            title: skill.name || skill.title,
            description: skill.description || '',
            icon: skill.icon || 'Sparkles',
            skills: (skill.skills || [])
              .filter((s: any) => !s.name?.includes?.(' ') || s.proficiency_level !== 'expert')
              .map((s: any) => s.name || s),
            tools: (skill.skills || [])
              .filter((s: any) => s.proficiency_level === 'expert' || (s.name && s.name.includes(' ')))
              .map((s: any) => s.name || s),
          };

          return <SkillCard key={skill.title || skill.name} skill={transformedSkill} />;
        })}
      </div>
      {/* <InteractiveSkillCloud data={categories} /> */}
    </SectionShell>
  );
};

type TagItem = {
  tool: string;
  category: string;
};

type InteractiveSkillCloudProps = {
  data?: any[];
};

const InteractiveSkillCloud = ({ data }: InteractiveSkillCloudProps) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  if (!data || data.length === 0) return null;
  const categories_data = data;

  const allTags: TagItem[] = useMemo(
    () =>
      categories_data.flatMap((category: any) => {
        const skills = category.skills || [];
        return skills.map((tool: any) => ({
          tool: typeof tool === 'string' ? tool : tool.name || tool,
          category: category.name || category.title,
        }));
      }),
    [categories_data]
  );

  const categories = useMemo(
    () => categories_data.map((c: any) => c.name || c.title),
    [categories_data]
  );

  const filteredCount =
    activeFilter === "all"
      ? allTags.length
      : allTags.filter((t) => t.category === activeFilter).length;

  return (
    <div className="mt-10 rounded-2xl border border-white/[0.06] p-5 lg:p-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
          Interactive
        </p>
        <h3 className="text-xl font-medium text-white">
          {allTags.length}+ tools and technologies across {categories.length}{" "}
          domains.
        </h3>
        <p className="text-sm text-zinc-400">
          Filter by category to explore capabilities.{" "}
          <span className="text-zinc-500">
            Showing {filteredCount} of {allTags.length} skills.
          </span>
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition-all duration-200 cursor-pointer",
            activeFilter === "all"
              ? "gradient-text border-purple-400/40 bg-purple-500/10"
              : "border-white/[0.06] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300"
          )}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() =>
              setActiveFilter(activeFilter === category ? "all" : category)
            }
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-all duration-200 cursor-pointer",
              activeFilter === category
                ? "gradient-text border-indigo-400/40 bg-indigo-500/10"
                : "border-white/[0.06] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Tags Grid */}
      <div className="mt-6 flex flex-wrap gap-2">
        {allTags.map(({ tool, category }, index) => {
          const isActive =
            activeFilter === "all" || activeFilter === category;
          return (
            <span
              key={`${tool}-${index}`}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition-all duration-300",
                isActive
                  ? "gradient-text border-purple-400/40"
                  : "border-white/[0.06] text-zinc-500"
              )}
            >
              {tool}
            </span>
          );
        })}
      </div>
    </div>
  );
};

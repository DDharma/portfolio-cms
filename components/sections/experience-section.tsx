import { Briefcase, MapPin } from "lucide-react";

import { SectionShell } from "@/components/sections/section-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ExperienceSectionProps = {
  data?: any[];
  sectionHeading?: { heading: string; title: string; description?: string } | null;
};

export const ExperienceSection = ({ data, sectionHeading }: ExperienceSectionProps) => {
  if (!data || data.length === 0) return null;
  const experience = data;

  return (
    <SectionShell id="experience">
      <SectionHeading
        heading={sectionHeading?.heading ?? 'Experience'}
        title={sectionHeading?.title ?? '4+ years of building, leading, and scaling.'}
        description={sectionHeading?.description ?? 'From SDE-1 to SDE-3 — leading teams, architecting AI-driven platforms, and delivering measurable business impact across enterprise products.'}
      />
      <div className="mt-12 space-y-4">
        {experience.map((item: any) => {
          const achievements = item.experience_achievements || item.achievements || [];
          const techStack = item.experience_tech_stack || item.stack || [];
          const period = item.period || `${item.start_date} - ${item.end_date || 'Present'}`;

          return (
            <Card
              key={`${item.company}-${period}`}
              className="p-5 lg:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5" />
                      {item.title || item.role}
                    </Badge>
                    <span className="text-sm text-zinc-500">
                      {item.company}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-zinc-400">
                    {item.description || item.summary}
                  </p>
                </div>
                <div className="text-sm text-zinc-400 lg:text-right lg:shrink-0">
                  <p className="font-medium text-white">
                    {period}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 lg:justify-end">
                    <MapPin className="h-3.5 w-3.5" /> {item.location}
                  </p>
                </div>
              </div>
              {achievements.length > 0 && (
                <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                  {achievements.map((achievement: any) => {
                    const text = achievement.achievement || achievement;
                    return (
                      <li key={text} className="flex gap-3">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
                        <p>{text}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                {techStack.map((tool: any) => {
                  const toolName = tool.technology || tool;
                  return (
                    <Badge key={toolName} variant="outline">
                      {toolName}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </SectionShell>
  );
};

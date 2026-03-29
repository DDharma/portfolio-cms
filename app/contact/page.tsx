import type { Metadata } from "next";

import { ContactSection } from "@/components/sections/contact-section";
import { SectionShell } from "@/components/sections/section-shell";
import { SectionHeading } from "@/components/sections/section-heading";

export const metadata: Metadata = {
  title: "Contact · Dharmvir Dharmacharya",
  description:
    "Get in touch for senior frontend engineering roles, AI integration projects, or technical collaborations. I'll respond within two business days.",
};

const steps = [
  "Project overview or problem statement",
  "Key audience and success metric",
  "Timeline, budget, and decision process",
  "Existing research, assets, or inspiration",
];

export default function ContactPage() {
  return (
    <>
      <ContactSection />
      <SectionShell id="contact-details">
        <SectionHeading
          heading="Preparation"
          title="What helps us move fast"
          description="Send over a short brief or deck if you have one. Otherwise, a few bullets covering the checklist below will do."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step}
              className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-5 text-sm text-zinc-300"
            >
              {step}
            </div>
          ))}
        </div>
      </SectionShell>
    </>
  );
}

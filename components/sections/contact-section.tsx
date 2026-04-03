import Link from 'next/link'
import { Mail, MapPin, CalendarDays, ArrowUpRight } from 'lucide-react'

import { SectionShell } from '@/components/sections/section-shell'
import { SectionHeading } from '@/components/sections/section-heading'
import { contactDetails } from '@/utils/data'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ContactSettings } from '@/lib/validations/contact.schema'

type ContactSectionProps = {
  data?: ContactSettings | null
}

export const ContactSection = ({ data }: ContactSectionProps) => {
  const contact = data || contactDetails
  return (
    <SectionShell id="contact">
      <SectionHeading
        heading="Contact"
        title="Let's make ambitious things feel effortless."
        description="Tell me about the problem space, the team, and the timeline. Expect a thoughtful reply within 12 hours."
        align="center"
      />
      <div className="relative mx-auto mt-12 max-w-3xl space-y-6 overflow-hidden rounded-2xl border border-white/[0.06] p-6 lg:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="contact-chip">
            <Mail className="h-5 w-5 text-zinc-400" />
            <a
              href={`mailto:${contact.email}`}
              className="text-white underline-offset-4 hover:underline"
            >
              {contact.email}
            </a>
          </div>
          <div className="contact-chip">
            <MapPin className="h-5 w-5 text-zinc-400" />
            <span>{contact.location}</span>
          </div>
          <div className="contact-chip">
            <CalendarDays className="h-5 w-5 text-zinc-400" />
            <span>{contact.availability}</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {contact.socials?.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              target="_blank"
              rel="noreferrer"
            >
              {social.label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
        <div className="grid gap-3 text-center text-sm text-zinc-400 md:grid-cols-3">
          {contact.callouts?.map((item) => (
            <div key={item} className="rounded-xl border border-white/[0.04] px-4 py-3">
              {item}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}

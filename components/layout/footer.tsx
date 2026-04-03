import Link from "next/link";

import { socialLinks } from "@/utils/data";

export const Footer = ({ resumeUrl }: { resumeUrl: string | null }) => {
  return (
    <footer className="border-t border-white/[0.04] py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium tracking-[0.1em] text-white">
            Dharmvir Dharmacharya
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Senior Frontend Engineer
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
          {socialLinks.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              className="transition-colors duration-200 hover:text-zinc-200"
            >
              {social.label}
            </Link>
          ))}
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-zinc-200"
            >
              Resume
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

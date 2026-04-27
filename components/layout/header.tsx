"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { useState, useRef, useLayoutEffect } from "react";

import { navLinks } from "@/utils/data";
import { cn } from "@/lib/utils";

export const Header = ({ resumeUrl }: { resumeUrl: string | null }) => {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const triggerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href;
  };

  const [submenuPos, setSubmenuPos] = useState({ top: 0, left: 0 });

  const activeSubmenu = navLinks.find(
    (link) => link.submenu && link.label === openSubmenu
  );

  useLayoutEffect(() => {
    if (!openSubmenu) return;
    const trigger = triggerRefs.current[openSubmenu];
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setSubmenuPos({ top: rect.bottom + 4, left: rect.left });
  }, [openSubmenu]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 flex items-center justify-center">
      <div className="max-w-full flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-zinc-950/80 px-4 py-2.5 backdrop-blur-xl overflow-x-auto scrollbar-hide">
        <Link
          href="/"
          className="text-lg font-medium text-white bg-white/[0.06] rounded-full px-4 py-2 cursor-pointer transition-colors duration-200 hover:bg-white/[0.1] shrink-0"
        >
          D
        </Link>
        <nav className="flex items-center gap-1.5">
          {navLinks.map((link) => (
            <div
              key={link.label}
              ref={(el) => {
                if (link.submenu) triggerRefs.current[link.label] = el;
              }}
              onMouseEnter={() => link.submenu && setOpenSubmenu(link.label)}
              onMouseLeave={() => setOpenSubmenu(null)}
            >
              <Link
                href={link.href}
                className={cn(
                  "rounded-full hover:rounded-full hover:bg-white/[0.06] px-5 py-2.5 text-[15px] tracking-normal text-zinc-500 transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0",
                  isActive(link.href)
                    ? "bg-white/[0.06] text-white"
                    : "hover:text-zinc-200"
                )}
              >
                {link.label}
              </Link>
            </div>
          ))}
        </nav>
        {resumeUrl && (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full text-zinc-950 px-4 py-2 text-[15px] font-medium transition-colors duration-200 whitespace-nowrap shrink-0"
          >
            <span className="gradient-text">Resume</span>
            <ArrowUpRight className="h-3.5 w-3.5 gradient-icon" />
          </a>
        )}
      </div>

      {activeSubmenu && (
        <div
          className="fixed z-[100] bg-zinc-950/95 border border-white/[0.06] rounded-full backdrop-blur-xl min-w-max flex items-center gap-1.5 px-2 py-2"
          style={submenuPos}
          onMouseEnter={() => setOpenSubmenu(activeSubmenu.label)}
          onMouseLeave={() => setOpenSubmenu(null)}
        >
          {activeSubmenu.submenu!.map((sublink) => (
            <Link
              key={sublink.label}
              href={sublink.href}
              className="px-5 py-2.5 text-[15px] hover:rounded-full hover:bg-white/[0.06] transition-colors duration-200"
            >
              <span className="gradient-text">{sublink.label}</span>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

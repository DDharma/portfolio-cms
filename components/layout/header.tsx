"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowBigDown } from "lucide-react";
import { useState } from "react";

import { navLinks } from "@/utils/data";
import { cn } from "@/lib/utils";

export const Header = () => {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 flex items-center justify-center">
      <div className="max-w-full flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-zinc-950/80 px-4 py-2.5 backdrop-blur-xl overflow-visible scrollbar-hide">
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
              className="relative group"
              onMouseEnter={() => link.submenu && setOpenSubmenu(link.label)}
              onMouseLeave={() => setOpenSubmenu(null)}
            >
              <Link
                href={link.href}
                className={cn(
                  "rounded-full hover:rounded-full hover:bg-white/[0.06]  px-5 py-2.5 text-[15px] tracking-normal text-zinc-500 transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0",
                  isActive(link.href)
                    ? "bg-white/[0.06] text-white"
                    : "hover:text-zinc-200"
                )}
              >
                {link.label}
              </Link>
              {link.submenu && openSubmenu === link.label && (
                <div className="absolute top-full left-0 mt-1 bg-zinc-950/95 border border-white/[0.06] rounded-full backdrop-blur-xl min-w-max flex items-center gap-1.5 px-2 py-2">
                  {link.submenu.map((sublink) => (
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
            </div>
          ))}
        </nav>
        <a
          href="/Senior_Frontend_Developer_React_Nextjs_Dharmvir.pdf"
          download
          className="flex items-center gap-1 rounded-full text-zinc-950 px-4 py-2 text-[15px] font-medium transition-colors duration-200  whitespace-nowrap shrink-0"
        >
          <span className="gradient-text">Resume</span>
          <ArrowBigDown className="h-3.5 w-3.5 gradient-icon" />
        </a>
      </div>
    </header>
  );
};

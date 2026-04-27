import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";

import "./globals.css"; //--- IGNORE ---

import { ThemeProvider } from "@/components/theme/theme-provider";
import { RootLayoutContent } from "@/components/layout/root-layout-content";
import { AuthProvider } from "@/lib/auth/auth-context";
import { DynamicStylesProvider } from "@/components/dynamic-styles-provider";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dharmvir Dharmacharya · Senior Frontend Engineer",
  description:
    "Senior Frontend Engineer (SDE-3) with 4+ years building scalable, AI-powered enterprise applications. Expertise in React, Next.js, TypeScript, and AI integration (OpenAI, Claude, OpenRouter).",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use a plain anon client (no cookies) so the layout works during
  // static generation where cookies() is unavailable
  let resumeUrl: string | null = null;
  let customStyles: any[] = [];
  let ownerTagline: string | null = null;
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [contactResult, stylesResult, heroResult] = await Promise.all([
      supabase.from("contact_settings").select("*").limit(1).single(),
      supabase
        .from("custom_styles")
        .select("id, name, css_rules, is_active")
        .eq("is_active", true),
      supabase
        .from("hero_content")
        .select("subtitle")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);
    resumeUrl = contactResult.data?.resume_url ?? null;
    customStyles = stylesResult.data || [];
    const subtitle = heroResult.data?.subtitle;
    ownerTagline = typeof subtitle === "string" ? subtitle : null;
  } catch {
    // Layout renders fine without this data
  }

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          geistMono.variable,
          "relative min-h-screen overflow-hidden bg-[oklch(0.09_0.005_270)] font-[family-name:var(--font-inter)] text-zinc-300 antialiased"
        )}
      >
        <DynamicStylesProvider styles={customStyles} />
        <AuthProvider>
          <ThemeProvider>
            <RootLayoutContent resumeUrl={resumeUrl} ownerTagline={ownerTagline}>
              {children}
            </RootLayoutContent>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";

import "./globals.css"; //--- IGNORE ---

import { ThemeProvider } from "@/components/theme/theme-provider";
import { RootLayoutContent } from "@/components/layout/root-layout-content";
import { AuthProvider } from "@/lib/auth/auth-context";
import { DynamicStylesProvider } from "@/components/dynamic-styles-provider";
import { createClient } from "@/lib/supabase/server";
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
  // Fetch active custom styles server-side to inject into page
  let customStyles: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("custom_styles")
      .select("id, name, css_rules, is_active")
      .eq("is_active", true);
    customStyles = data || [];
  } catch (error) {
    console.error("Failed to fetch custom styles:", error);
    // Continue with empty styles array if fetch fails
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
            <RootLayoutContent>
              {children}
            </RootLayoutContent>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

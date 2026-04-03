import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";

import "./globals.css"; //--- IGNORE ---

import { ThemeProvider } from "@/components/theme/theme-provider";
import { RootLayoutContent } from "@/components/layout/root-layout-content";
import { AuthProvider } from "@/lib/auth/auth-context";
import { DynamicStylesProvider } from "@/components/dynamic-styles-provider";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings, DEFAULT_SITE_NAME } from "@/lib/api/contact";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings
      ? `${settings.site_name} · ${settings.site_title}`
      : DEFAULT_SITE_NAME,
    description: settings?.site_description ?? "A developer portfolio.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch layout data server-side in parallel
  let customStyles: any[] = [];
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;
  try {
    const supabase = await createClient();
    const [siteSettings, stylesResult] = await Promise.all([
      getSiteSettings(),
      supabase
        .from("custom_styles")
        .select("id, name, css_rules, is_active")
        .eq("is_active", true),
    ]);
    settings = siteSettings;
    customStyles = stylesResult.data || [];
  } catch (error) {
    console.error("Failed to fetch layout data:", error);
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
            <RootLayoutContent siteSettings={{
              siteName: settings?.site_name ?? DEFAULT_SITE_NAME,
              siteTitle: settings?.site_title ?? 'Developer',
              siteLogo: settings?.site_logo ?? 'P',
              resumeUrl: settings?.resume_url ?? null,
              socials: settings?.socials ?? [],
            }}>
              {children}
            </RootLayoutContent>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../site.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileBar } from "@/components/site/MobileBar";
import { ServiceWorkerRegister } from "@/components/site/ServiceWorkerRegister";
import { getSettings } from "@/lib/data/public";
import { getSiteUrl } from "@/lib/env";
import { isLocale, locales, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#007338",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const settings = await getSettings();
  const dict = getDictionary(lang);
  const name = pick(settings, "company_name", lang);
  const tagline = pick(settings, "tagline", lang);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: `${name} | ${tagline || dict.meta.defaultTitle}`, template: `%s | ${name}` },
    description: dict.meta.defaultDescription,
    applicationName: name,
    appleWebApp: { capable: true, title: name, statusBarStyle: "default" },
    openGraph: {
      type: "website",
      siteName: name,
      locale: lang === "vi" ? "vi_VN" : "en_US",
      alternateLocale: lang === "vi" ? "en_US" : "vi_VN",
    },
    formatDetection: { telephone: false },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang} className={inter.variable}>
      <body>
        <a className="skip-link" href="#main">
          {lang === "vi" ? "Bỏ qua điều hướng" : "Skip to content"}
        </a>
        <Header lang={lang} />
        <main id="main">{children}</main>
        <Footer lang={lang} />
        <MobileBar lang={lang} />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { siteConfig, education, experiences } from "@/lib/data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [
    "Roger McKenzie",
    "software developer",
    "software engineer",
    "University of Florida",
    "Computer Science student",
    "Amazon SDE intern",
    "React developer",
    "TypeScript",
    "Next.js",
    "tech YouTuber",
    "Gainesville Florida developer",
    "personal portfolio",
  ],
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: "@RogerMcKenzie",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1c" },
  ],
  width: "device-width",
  initialScale: 1,
};

const personId = `${siteConfig.url}/#person`;
const websiteId = `${siteConfig.url}/#website`;
const profilePageId = `${siteConfig.url}/#profilepage`;
const ufId = "https://www.ufl.edu/#organization";

const occupations = experiences.map((exp) => ({
  "@type": "OrganizationRole",
  roleName: exp.role,
  startDate: exp.period.split("—")[0]?.trim() || undefined,
  endDate: exp.period.split("—")[1]?.trim() || undefined,
  worksFor: {
    "@type": "Organization",
    name: exp.company,
    address: exp.location,
  },
}));

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: siteConfig.name,
      url: siteConfig.url,
      image: `${siteConfig.url}/profile.jpg`,
      description: siteConfig.description,
      email: `mailto:${siteConfig.social.email}`,
      jobTitle: "Software Developer",
      gender: "Male",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Gainesville",
        addressRegion: "FL",
        addressCountry: "US",
      },
      sameAs: [
        siteConfig.social.github,
        siteConfig.social.linkedin,
        siteConfig.social.youtube,
      ],
      knowsAbout: [
        "Software Engineering",
        "React",
        "TypeScript",
        "Next.js",
        "JavaScript",
        "Cloud Computing",
        "Deep Learning",
        "A/B Testing",
        "Chrome Extensions",
        "Web Development",
      ],
      alumniOf: {
        "@type": "CollegeOrUniversity",
        "@id": ufId,
        name: education.school,
        url: "https://www.ufl.edu",
        sameAs: "https://en.wikipedia.org/wiki/University_of_Florida",
      },
      hasOccupation: occupations,
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "en-US",
      publisher: { "@id": personId },
    },
    {
      "@type": "ProfilePage",
      "@id": profilePageId,
      url: siteConfig.url,
      name: siteConfig.title,
      isPartOf: { "@id": websiteId },
      about: { "@id": personId },
      mainEntity: { "@id": personId },
      dateModified: new Date().toISOString(),
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.rss2json.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

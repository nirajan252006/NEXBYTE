import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { business } from "@/lib/data";
import FloatingButtons from "@/components/FloatingButtons";
import NotificationProvider from "@/components/NotificationProvider";
import ClientModals from "@/components/ClientModals";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://nexbytetechnologies.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NexByte Technologies | Premium Computers, Laptops & IT Services in Bengaluru",
    template: "%s | NexByte Technologies",
  },
  description: business.description,
  keywords: [
    "NexByte Technologies",
    "computer store Bengaluru",
    "laptop repair Bengaluru",
    "gaming desktops",
    "business laptops",
    "CCTV installation Bengaluru",
    "custom PC assembly",
    "bulk laptop supply",
    "IT services Padmanabhanagar",
    "second hand laptops Bengaluru",
  ],
  authors: [{ name: "NexByte Technologies" }],
  creator: "NexByte Technologies",
  applicationName: "NexByte Technologies",
  formatDetection: { telephone: true, email: true, address: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "NexByte Technologies",
    title: "NexByte Technologies | Premium Computers, Laptops & IT Services",
    description: business.description,
    images: [
      {
        url: "/images/logo-horizontal.png",
        width: 1956,
        height: 804,
        alt: "NexByte Technologies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexByte Technologies | Premium Computers, Laptops & IT Services",
    description: business.description,
    images: ["/images/logo-horizontal.png"],
  },
  icons: {
    icon: "/images/logo-icon.png",
    shortcut: "/images/logo-icon.png",
    apple: "/images/logo-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#05070C",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: business.name,
  image: `${SITE_URL}/images/logo-horizontal.png`,
  "@id": SITE_URL,
  url: SITE_URL,
  telephone: business.phones[0],
  email: business.email,
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "#372, 1st Floor, MK Puttalingaiah Road, Uttarahalli Main Road",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560070",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 12.9086,
    longitude: 77.5442,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "20:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "10:00",
      closes: "17:00",
    },
  ],
  sameAs: [business.instagram, business.whatsappChannel],
  areaServed: [
    { "@type": "City", name: "Bengaluru" },
    { "@type": "City", name: "Tumkur" },
    { "@type": "City", name: "Hiriyur" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (let r of registrations) r.unregister();
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (let name of names) caches.delete(name);
                  });
                }
                navigator.serviceWorker.register('/sw.js');
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-nex-black text-nex-white">
        <NotificationProvider>
          {children}
          <FloatingButtons />
          <ClientModals />
        </NotificationProvider>
      </body>
    </html>
  );
}

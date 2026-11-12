import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";

const SITE_URL = "https://www.mqmcrypto.com";
const OG_TITLE = "MQM Crypto | Educação sobre Bitcoin, autocustódia e comunidade";
const OG_DESCRIPTION =
  "Educação sobre Bitcoin, cripto e autocustódia com Marcelo de Queiroz. Conheça a história por trás do MQM, a Comunidade MQM e a mentoria personalizada.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "MQM CRYPTO",
  description: OG_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "MQM Crypto",
    locale: "pt_BR",
    url: "/",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [
      {
        url: "/marketing/mqm/social-preview.jpg",
        width: 1200,
        height: 630,
        alt: "MQM Crypto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: ["/marketing/mqm/social-preview.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The lang attribute will be set in [locale]/layout.tsx
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&family=Outfit:wght@400;500;600;700;800&family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setTheme(theme) {
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  localStorage.setItem('theme', theme);
                }
                var storedTheme = localStorage.getItem('theme');
                if (storedTheme) {
                  setTheme(storedTheme);
                } else {
                  setTheme('dark');
                }
              })();
            `,
          }}
        />
        <AuthProvider>
           {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

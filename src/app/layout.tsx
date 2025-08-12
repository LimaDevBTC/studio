import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";

export const metadata: Metadata = {
  title: "MQM CRYPTO",
  description: "A premium platform for crypto education.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The lang attribute will be set in [locale]/layout.tsx
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
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

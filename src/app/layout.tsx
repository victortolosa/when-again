import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";

export const metadata: Metadata = {
  title: "DateKeeper - Track Time Beautifully",
  description: "Track habits, count down to events, and journal your days with beautiful visuals.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DateKeeper",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <Providers>
            {children}
            <PWAUpdatePrompt />
            <PWAInstallPrompt />
            <OfflineIndicator />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { SocketProvider } from "@/context/SocketContext";
import "@stream-io/video-react-sdk/dist/css/styles.css";

// 1. Separate Viewport export (Next.js 14+ standard)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  // This is the KEY fix for keyboards covering inputs
  interactiveWidget: "resizes-content",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Pulse - Chat App",
  description: "Real-time chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* We removed the manual <meta> and <style> tags here. 
            Next.js handles the viewport automatically now. */}
      </head>
      <body className="antialiased">
        <AppProvider>
          <SocketProvider>
            {/* Removed overflow-hidden from here - let individual pages control their own scroll */}
            <main className="min-h-[100dvh] w-full">{children}</main>
          </SocketProvider>
        </AppProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Navigation } from "@/components/layout/Navigation"
import { Toaster } from "@/components/ui/sonner"
import { UserProvider } from "@/components/providers/UserProvider"
import Script from "next/script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "로봇설계 PM",
  description: "로봇설계과 학생과 선생님을 위한 프로젝트 및 비품 관리 시스템",
  appleWebApp: {
    capable: true,
    title: "Robot PM",
    statusBarStyle: "default",
  },
  icons: {
    apple: '/icon.svg'
  }
}

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col`}>
        <UserProvider>
          <Navigation />
          <main className="flex-1 container mx-auto p-4 md:p-8">
            {children}
          </main>
          <Toaster />
        </UserProvider>
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}

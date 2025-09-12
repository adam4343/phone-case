import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/shared/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Custom Phone Cases - Design Your Perfect Case",
    template: "%s | Custom Phone Cases"
  },
  description: "Create personalized phone cases with your own designs. High-quality materials, fast shipping, and perfect fit guaranteed for all phone models.",
  keywords: ["custom phone cases", "personalized phone cases", "design phone case", "phone case maker", "custom mobile cases"],
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://phone-case-psi.vercel.app", 
    siteName: "Custom Phone Cases",
    title: "Custom Phone Cases - Design Your Perfect Case",
    description: "Create personalized phone cases with your own designs. High-quality materials, fast shipping, and perfect fit guaranteed.",
    images: [
      {
        url: "/open-graph.png", 
        width: 1200,
        height: 630,
        alt: "Custom Phone Cases - Design Your Perfect Case",
      },
    ],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  category: "E-commerce",
  classification: "Custom Phone Cases",
  

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <main className="flex grainy-light flex-col min-h-[calc(100vh-3.5rem-1px)]">
            <div className="flex-1 flex flex-col h-full">
              {children}
            </div>
            <Footer />
          </main>
        </Providers>
      </body>
    </html>
  );
}
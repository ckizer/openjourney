import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Openjourney",
  description: "An open source playground for your favorite media models inspired by the Midjourney UI",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var s=localStorage.getItem('openjourney-dark-mode');var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='true'||(s===null&&m)){document.documentElement.classList.add('dark')}}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}

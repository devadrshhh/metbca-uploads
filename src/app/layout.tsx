import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
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
  title: "Study Materials Portal",
  description: "Access, download, and share study materials easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 selection:bg-black selection:text-white">
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
                <svg
                  className="h-6 w-6 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>Study Materials Portal</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                <Link href="/" className="hover:text-black transition-colors">
                  Browse Materials
                </Link>
                <Link href="/uploads" className="hover:text-black transition-colors">
                  User Uploads
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/uploads"
                className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                Upload File
              </Link>
            </div>
          </div>
          {/* Mobile sub-nav */}
          <div className="flex md:hidden border-t border-gray-100 bg-white px-4 py-2 justify-around text-xs font-medium text-gray-500">
            <Link href="/" className="hover:text-black transition-colors py-1">
              Browse
            </Link>
            <Link href="/uploads" className="hover:text-black transition-colors py-1">
              User Uploads
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col">{children}</main>

        <footer className="border-t border-gray-200 bg-white py-8">
          <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-500 sm:px-6 lg:px-8">
            <p>&copy; {new Date().getFullYear()} Study Materials Portal. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

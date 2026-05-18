import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import RunBanner from "@/components/RunBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gym Buddy - Workout Tracker",
  description: "Track workouts and compete with your friend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Dumbbell className="h-8 w-8 text-primary mr-2" />
                  <span className="text-xl font-bold text-gray-900">Gym Buddy</span>
                </div>
                <div className="flex space-x-4 items-center">
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    This Week
                  </Link>
                  <Link
                    href="/marathon"
                    className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Full Plan
                  </Link>
                  <Link
                    href="/summary"
                    className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Summary
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <RunBanner />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

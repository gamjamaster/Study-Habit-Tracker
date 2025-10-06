import Providers from "@/components/Providers"; // import providers component
import Sidebar from "@/components/Sidebar"; // import sidebar component
import "./globals.css"; // import global css for Tailwind and custom theme application
import type { Metadata } from "next";

// Metadata for the application (shows in browser tab)
export const metadata: Metadata = {
  title: "StudyFlow - Track Your Study & Life Habits",
  description: "Comprehensive study and lifestyle habit tracker with analytics and insights",
};

// declares this file is the layout component
// allows the pages to be rendered within this layout by getting children prop
// set the type of children to React.ReactNode with TypeScript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* set the language of the page to english */
    <html lang="en">
      <body className="bg-gray-100 font-sans">
        <Providers>
          <Sidebar />
          {/* Main content area with responsive margins for sidebar */}
          <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
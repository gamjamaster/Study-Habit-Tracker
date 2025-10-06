import Providers from "@/components/Providers"; // import providers component
import Sidebar from "@/components/Sidebar"; // import sidebar component
import "./globals.css"; // import global css for Tailwind and custom theme application

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
          {/* Main content area with responsive margins and padding */}
          <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
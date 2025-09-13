import Sidebar from "@/components/Sidebar"; // import the sidebar component
import { AuthProvider } from "@/contexts/AuthContext"; // import auth context provider
import "./globals.css"; // import global css for Tailwind and custom theme application

// declares this file is the layput component
// allows the pages to be rendered within tis layout by getting children prop
// set the type of children to React.ReactNode with typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* set the language of the page to english */
    <html lang="eng"> 
      <body className="bg-gray-100 font-sans">
        <AuthProvider>
          {/* display the side bar */}
          <Sidebar />
          {/* resoponsive main contents */}
          <main className="lg:ml-60 min-h-screen p-4 lg:p-8 pt-20 lg:pt-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
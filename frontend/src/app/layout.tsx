import Sidebar from "@/components/Sidebar"; // import the sidebar component
import { AuthProvider } from "@/contexts/AuthContext"; // import auth context provider
import { QueryClientProvider, getQueryClient } from "@/lib/queryClient"; // import query client for API caching
import "./globals.css"; // import global css for Tailwind and custom theme application

// declares this file is the layout component
// allows the pages to be rendered within this layout by getting children prop
// set the type of children to React.ReactNode with TypeScript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid using useState here as it can cause hydration issues
  const queryClient = getQueryClient();

  return (
    /* set the language of the page to english */
    <html lang="en">
      <body className="bg-gray-100 font-sans">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {/* display the sidebar */}
            <Sidebar />
            {/* responsive main contents */}
            <main className="lg:ml-60 min-h-screen p-4 lg:p-8 pt-20 lg:pt-8">
              {children}
            </main>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
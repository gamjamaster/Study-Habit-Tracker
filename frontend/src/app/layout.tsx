import Sidebar from "@/components/Sidebar"; // import the sidebar component
import "./globals.css"; // import global css for Tailwind and custom theme application

// declares this file is the layput component
// allows the pages to be rendered within tis layout by getting children prop
// set the type of children to React.ReactNode with typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* set the language of the page to english */
    <html lang="eng"> 
      <body className="bg-gray-100 font-sans">
        {/* display the side bar */}
        <Sidebar />
        {/* 반응형 메인 콘텐츠 영역 */}
        <main className="lg:ml-60 min-h-screen p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </body>
    </html>
  );
}
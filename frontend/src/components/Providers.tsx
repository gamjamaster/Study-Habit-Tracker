"use client";

import Sidebar from "@/components/Sidebar"; // import the sidebar component
import { AuthProvider } from "@/contexts/AuthContext"; // import auth context provider
import { TimerProvider } from "@/contexts/TimerContext"; // import timer context provider
import { QueryClientProvider, getQueryClient } from "@/lib/queryClient"; // import query client for API caching

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TimerProvider>
        {/* display the sidebar */}
        <Sidebar />
        {/* responsive main contents */}
        <main className="lg:ml-60 min-h-screen p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
        </TimerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
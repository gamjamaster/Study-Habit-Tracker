"use client"; // client component of Next.js

import Link from "next/link"; // link component for page redirection
import { usePathname } from "next/navigation"; // hook to know the current path
import { useState } from "react"; // React state hook
import { useRouter } from "next/navigation"; // Add router import
import { useAuth } from "@/contexts/AuthContext"; // import auth context
import { useTimer } from "@/contexts/TimerContext"; // import timer context
// bring necessary icons from heroicons lib
import {
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";

// array of menu names to be displayed on the sidebar
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
  { name: "Timer", href: "/timer", icon: ClockIcon },
  { name: "Study", href: "/study", icon: BookOpenIcon },
  { name: "Subjects", href: "/subjects", icon: AcademicCapIcon },
  { name: "Habits", href: "/habit", icon: CheckCircleIcon },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Groups", href: "/groups", icon: UserIcon },
  { name: "Personal Data", href: "/personal-data", icon: DocumentChartBarIcon },
];

// make a responsive sidebar component
export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { time, isRunning } = useTimer();
  const pathname = usePathname(); // store the directory of the current page in the pathname variable
  const router = useRouter(); // Add router hook
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // mobile menu state

  // Format time for display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white px-4 py-3 flex items-center justify-between z-30">
        <h1 className="text-xl font-bold">StudyFlow</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-800"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Overray */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 bg-gray-900 text-gray-100 flex flex-col shadow-lg z-30 transition-transform duration-300
        lg:translate-x-0 lg:w-60 lg:px-6 lg:py-8
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 px-4 py-16
      `}>
        {/* Logo */}
        <div className="text-2xl font-bold mb-10 select-none tracking-tight px-2">
          StudyFlow
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href} // an unique key is needed to render a react list
              href={item.href} // path to redirect to when clicked
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition relative
                ${
                  pathname?.startsWith(item.href) // if the current page (pathname) and href of the menu are the same, apply the style below
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800 text-gray-200"
                }`}
            >
              {/* display icon */}
              <item.icon className="w-6 h-6 flex-shrink-0" />
              {/* display menu names */}
              <span className="font-medium">{item.name}</span>
              {/* Timer indicator */}
              {item.name === "Timer" && isRunning && (
                <span className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono">{formatTime(time)}</span>
                </span>
              )}
            </Link>
          ))}
        </nav>
        
        {/* Authentication Section */}
        <div className="border-t border-gray-700 pt-4 space-y-2">
          {user ? (
            <>
              {/* User Profile */}
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                <UserIcon className="w-5 h-5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </Link>
              
              {/* Sign Out Button */}
              <button
                onClick={async () => {

                  try {
                    const { error } = await signOut();

                    if (error) {
                      // AuthSessionMissingError는 일반적인 경우이므로 사용자에게 경고하지 않음
                      if (error.message !== 'Auth session missing!') {
                        alert('로그아웃 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.');
                        return;
                      }
                    }

                    // Force page reload to clear any cached state in production
                    if (typeof window !== 'undefined' && window.location) {
                      window.location.href = '/auth/login';
                    } else {
                      router.push('/auth/login');
                    }
                  } catch {
                    console.error('💥 Exception in sign out handler');
                    alert('로그아웃 중 예기치 않은 오류가 발생했습니다. 페이지를 새로고침 해주세요.');
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition hover:bg-gray-800 text-gray-200 w-full text-left"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              {/* Sign In Button */}
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition hover:bg-gray-800 text-gray-200"
              >
                <ArrowLeftOnRectangleIcon className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">Sign In</span>
              </Link>
            </>
          )}
        </div>
        
        {/* copyright */}
        <div className="mt-4 text-xs text-gray-500 px-2">© 2025 GamjaMaster</div>
      </aside>
    </>
  );
}
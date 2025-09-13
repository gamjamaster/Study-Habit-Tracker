"use client"; // client component of Next.js

import Link from "next/link"; // link component for page redirection
import { usePathname } from "next/navigation"; // hook to know the current path
import { useState } from "react"; // React state hook
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
} from "@heroicons/react/24/outline";

// array of menu names to be displayed on the sidebar
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
  { name: "Timer", href: "/timer", icon: ClockIcon },
  { name: "Study", href: "/study", icon: BookOpenIcon },
  { name: "Subjects", href: "/subjects", icon: AcademicCapIcon },
  { name: "Habits", href: "/habit", icon: CheckCircleIcon },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
];

// make a responsive sidebar component
export default function Sidebar() {
  const pathname = usePathname(); // store the directory of the current page in the pathname variable
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // mobile menu state

  return (
    <>
      {/* 모바일 헤더 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white px-4 py-3 flex items-center justify-between z-30">
        <h1 className="text-xl font-bold">MyRoutine</h1>
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

      {/* 모바일 오버레이 */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside className={`
        fixed inset-y-0 left-0 bg-gray-900 text-gray-100 flex flex-col shadow-lg z-30 transition-transform duration-300
        lg:translate-x-0 lg:w-60 lg:px-6 lg:py-8
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 px-4 py-16
      `}>
        {/* 로고 */}
        <div className="text-2xl font-bold mb-10 select-none tracking-tight px-2">
          MyRoutine
        </div>
        
        {/* 네비게이션 */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href} // an unique key is needed to render a react list
              href={item.href} // path to redirect to when clicked
              onClick={() => setIsMobileMenuOpen(false)} // 모바일에서 링크 클릭 시 메뉴 닫기
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
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
            </Link>
          ))}
        </nav>
        
        {/* 저작권 */}
        <div className="mt-auto text-xs text-gray-500 px-2">© 2025 GamjaMaster</div>
      </aside>
    </>
  );
}
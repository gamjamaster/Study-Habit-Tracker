"use client"; // client component of Next.js

import Link from "next/link"; // link component for page redirection
import { usePathname } from "next/navigation"; // hook to know the current path
// bring necessary icons from heroicons lib
import {
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
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

// make a sidebar component
export default function Sidebar() {
  const pathname = usePathname(); // store the directory of the current page in the pathname variable

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-gray-900 text-gray-100 flex flex-col px-6 py-8 shadow-lg z-20">
      {/* entire sidebar style */}
      <div className="text-2xl font-bold mb-10 select-none tracking-tight">
        MyRoutine
      </div>
      {/* iterate over each menu items (navItems) and render as Link */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href} // an unique key is needed to render a react list
            href={item.href} // path to redirect to when clicked
            // center align icon and text, gap, padding, round and transition effects
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
              ${
                pathname?.startsWith(item.href) // if the current page (pathname) and href of the menu are the same, apply the style below
                  ? "bg-primary-500 text-white"
                  : "hover:bg-gray-800 text-gray-200"
              }`}
          >
            {/* display icon */}
            <item.icon className="w-6 h-6" /> 
            {/* display menu names */}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
      {/* copyright text at the bottom of the page */}
      <div className="mt-auto text-xs text-gray-500">© 2025 GamjaMaster</div>
    </aside>
  );
}
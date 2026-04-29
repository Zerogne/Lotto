"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Ticket, PlusCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Хяналт", icon: LayoutDashboard, exact: true },
  { href: "/admin/lotteries", label: "Сугалаа", icon: List, exact: false },
  { href: "/admin/tickets", label: "Тасалбар", icon: Ticket, exact: false },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-gray-200 py-4 px-3 gap-1">
        <Link href="/admin" className="flex items-center gap-2 px-3 py-2 mb-4">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="font-bold text-gray-900">LottoMN Admin</span>
        </Link>
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(href, exact)
                ? "bg-amber-50 text-amber-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link
            href="/admin/lotteries/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Шинэ сугалаа
          </Link>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 flex">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors min-h-[56px]",
              isActive(href, exact) ? "text-amber-600" : "text-gray-500"
            )}
          >
            <Icon className="h-5 w-5 mb-0.5" />
            {label}
          </Link>
        ))}
        <Link
          href="/admin/lotteries/new"
          className="flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium text-amber-600 min-h-[56px]"
        >
          <PlusCircle className="h-5 w-5 mb-0.5" />
          Шинэ
        </Link>
      </nav>
    </>
  );
}

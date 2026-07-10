import Link from "next/link";
import { Trophy } from "lucide-react";

export default function PublicNav() {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span>BLCK Авто Худалдаа</span>
        </Link>
      </div>
    </nav>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-amber-600 font-black text-xs uppercase tracking-widest mb-2">404</p>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Хуудас олдсонгүй</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-md">
        Энэ хаягаар сугалаа эсвэл контент байхгүй байна. Нүүр хуудас руу буцна уу.
      </p>
      <Link
        href="/"
        className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-8 py-3 rounded-xl transition-colors"
      >
        Нүүр рүү буцах
      </Link>
    </div>
  );
}

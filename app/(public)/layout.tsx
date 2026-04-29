import PublicNav from "@/components/public/PublicNav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main>{children}</main>
    </div>
  );
}

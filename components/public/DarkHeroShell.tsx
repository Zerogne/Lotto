import { cn } from "@/lib/utils";

// Shared dark gradient background used across public hero sections.
// Children are responsible for their own relative/z-10 positioning.
export default function DarkHeroShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-gray-900", className)}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.05) 20px,rgba(255,255,255,0.05) 40px)",
        }}
      />
      {children}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "⚡" },
  { href: "/inventory", label: "Inventory", icon: "🎣" },
  { href: "/guide", label: "AI Guide", icon: "🤖" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="nav-gradient fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 gap-1"
      style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
      <Link href="/" className="mr-4 flex items-center gap-2 flex-shrink-0">
        <span className="font-orbitron text-base font-bold tracking-widest neon-pink">
          STRIKE<span className="neon-cyan">WAVE</span>
        </span>
      </Link>

      <div className="flex items-center gap-1 ml-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${active
                  ? "bg-neon-pink/20 text-neon-pink shadow-neon"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <span className="text-xs">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

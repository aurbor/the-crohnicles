"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "./nav-links";

export function NavBar({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1">
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
              active
                ? "brand-gradient text-white shadow-sm"
                : "text-muted hover:bg-brand-violet/10 hover:text-foreground"
            }`}
          >
            <span aria-hidden>{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

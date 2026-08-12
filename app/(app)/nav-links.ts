export interface NavLink {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/diary", label: "Quick Add", icon: "➕", adminOnly: true },
  { href: "/journal", label: "Journal", icon: "📓", adminOnly: true },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/items", label: "Items", icon: "🥤", adminOnly: true },
  { href: "/medications", label: "Meds", icon: "💊", adminOnly: true },
  { href: "/settings", label: "Settings", icon: "⚙️", adminOnly: true },
];

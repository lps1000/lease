"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  Bike, 
  StickyNote,
  Home,
} from "lucide-react"

interface SidebarProps {
  basePath?: string;
}

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Leaserijders",
    href: "/leaserijders",
    icon: Users,
  },
  {
    title: "Onderhoud",
    href: "/onderhoud",
    icon: Bike,
  },
  {
    title: "Notities",
    href: "/notities",
    icon: StickyNote,
  },
  {
    title: "Snelapi",
    href: "/snelapi",
    icon: StickyNote,
  },
]

export function Sidebar({ basePath = "/" }: SidebarProps) {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: `${basePath}dashboard`, icon: Home },
    { name: "Leaserijders", href: `${basePath}leaserijders`, icon: Users },
    { name: "Onderhoud", href: `${basePath}onderhoud`, icon: Bike },
    { name: "Notities", href: `${basePath}notities`, icon: StickyNote },
    { name: "Snelapi", href: `${basePath}snelapi`, icon: StickyNote },
  ]

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-white dark:bg-gray-800">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">Lease CRM</h2>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                pathname === link.href 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
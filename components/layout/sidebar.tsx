'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ListMusic, Heart, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { href: '/', label: '发现', icon: Home },
  { href: '/charts', label: '榜单', icon: ListMusic }, // Mapping charts to separate route or just filtering? Spec says "Discovery" and "Charts". Let's assume separate or query param. For now separate route /charts which might re-use page logic.
  { href: '/favorites', label: '收藏', icon: Heart },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64 border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            SunoHits
          </h2>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

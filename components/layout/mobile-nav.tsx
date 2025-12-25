'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
    { href: '/', label: '发现', icon: Home },
    { href: '/favorites', label: '收藏', icon: Heart },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-20 left-0 right-0 bg-background/95 backdrop-blur border-t z-40">
            <div className="flex justify-around items-center h-14">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                            {item.label}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

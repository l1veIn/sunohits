'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export type ChartId = 'top200' | 'daily' | 'weekly' | 'new' | 'dm' | 'stow'

export interface ChartInfo {
    id: ChartId
    name: string
    description: string
}

export const CHARTS: ChartInfo[] = [
    { id: 'top200', name: '总榜', description: '最多播放・半年' },
    { id: 'daily', name: '日榜', description: '最多播放・24小时' },
    { id: 'weekly', name: '周榜', description: '最多播放・一周' },
    { id: 'new', name: '新歌榜', description: '最新发布・一周' },
    { id: 'dm', name: '弹幕榜', description: '最多弹幕・半年' },
    { id: 'stow', name: '收藏榜', description: '最多收藏・半年' },
]

interface ChartTabsProps {
    current: ChartId
    onChange: (chartId: ChartId) => void
}

export function ChartTabs({ current, onChange }: ChartTabsProps) {
    return (
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {CHARTS.map((chart) => (
                <button
                    key={chart.id}
                    onClick={() => onChange(chart.id)}
                    className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                        current === chart.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                >
                    {chart.name}
                </button>
            ))}
        </div>
    )
}

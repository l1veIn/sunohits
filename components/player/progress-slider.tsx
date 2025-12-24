'use client'

import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface ProgressSliderProps {
  current: number
  duration: number
  onSeek: (value: number) => void
  className?: string
}

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ProgressSlider({ current, duration, onSeek, className }: ProgressSliderProps) {
  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      <span className="text-xs text-muted-foreground w-10 text-right">
        {formatTime(current)}
      </span>
      <Slider
        value={[current]}
        max={duration || 100}
        step={1}
        onValueChange={(vals) => onSeek(vals[0])}
        className="cursor-pointer"
      />
      <span className="text-xs text-muted-foreground w-10">
        {formatTime(duration)}
      </span>
    </div>
  )
}

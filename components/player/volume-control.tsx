'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

interface VolumeControlProps {
  volume: number
  onVolumeChange: (value: number) => void
}

export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  const isMuted = volume === 0

  const toggleMute = () => {
    if (isMuted) {
      onVolumeChange(1)
    } else {
      onVolumeChange(0)
    }
  }

  return (
    <div className="flex items-center gap-2 w-32">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
      <Slider
        value={[volume * 100]}
        max={100}
        step={1}
        onValueChange={(vals) => onVolumeChange(vals[0] / 100)}
        className="cursor-pointer"
      />
    </div>
  )
}

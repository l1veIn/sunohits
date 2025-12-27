'use client'

import { useState } from 'react'
import { Check, Plus, FolderHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { useFavoritesStore, DEFAULT_PLAYLIST_ID } from '@/lib/store/use-favorites-store'
import { Song } from '@/lib/store/use-player-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PlaylistPickerProps {
    song: Song
    children: React.ReactNode
    onComplete?: () => void
}

export function PlaylistPicker({ song, children, onComplete }: PlaylistPickerProps) {
    const { playlists, playlistSongs, addToPlaylist, removeFromPlaylist, createPlaylist } = useFavoritesStore()
    const [open, setOpen] = useState(false)
    const [showNewInput, setShowNewInput] = useState(false)
    const [newName, setNewName] = useState('')

    const isInPlaylist = (playlistId: string) => {
        return (playlistSongs[playlistId] || []).includes(song.bvid)
    }

    const togglePlaylist = (playlistId: string) => {
        if (isInPlaylist(playlistId)) {
            removeFromPlaylist(song.bvid, playlistId)
            toast.success('已从歌单移除')
        } else {
            addToPlaylist(song, playlistId)
            const playlist = playlists.find(p => p.id === playlistId)
            toast.success(`已添加到「${playlist?.name}」`)
        }
    }

    const handleCreateAndAdd = () => {
        if (newName.trim()) {
            const id = createPlaylist(newName.trim())
            addToPlaylist(song, id)
            toast.success(`已创建并添加到「${newName.trim()}」`)
            setNewName('')
            setShowNewInput(false)
            setOpen(false)
            onComplete?.()
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
                <div className="text-sm font-medium text-muted-foreground mb-2 px-2">
                    添加到歌单
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                    {playlists.map((playlist) => {
                        const isIn = isInPlaylist(playlist.id)
                        return (
                            <button
                                key={playlist.id}
                                className={cn(
                                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                                    "hover:bg-accent",
                                    isIn && "text-primary"
                                )}
                                onClick={() => togglePlaylist(playlist.id)}
                            >
                                <FolderHeart className="h-4 w-4 shrink-0" />
                                <span className="flex-1 text-left truncate">{playlist.name}</span>
                                {isIn && <Check className="h-4 w-4 shrink-0" />}
                            </button>
                        )
                    })}
                </div>

                <div className="border-t mt-2 pt-2">
                    {showNewInput ? (
                        <div className="flex items-center gap-1">
                            <Input
                                placeholder="歌单名称"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateAndAdd()
                                    if (e.key === 'Escape') setShowNewInput(false)
                                }}
                            />
                            <Button size="sm" className="h-8" onClick={handleCreateAndAdd} disabled={!newName.trim()}>
                                添加
                            </Button>
                        </div>
                    ) : (
                        <button
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            onClick={() => setShowNewInput(true)}
                        >
                            <Plus className="h-4 w-4" />
                            新建歌单
                        </button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

// Bulk add to playlist picker
interface BulkPlaylistPickerProps {
    songs: Song[]
    children: React.ReactNode
    onComplete?: () => void
}

export function BulkPlaylistPicker({ songs, children, onComplete }: BulkPlaylistPickerProps) {
    const { playlists, addManyToPlaylist, createPlaylist } = useFavoritesStore()
    const [open, setOpen] = useState(false)
    const [showNewInput, setShowNewInput] = useState(false)
    const [newName, setNewName] = useState('')

    const handleAddToPlaylist = (playlistId: string) => {
        addManyToPlaylist(songs, playlistId)
        const playlist = playlists.find(p => p.id === playlistId)
        toast.success(`已添加 ${songs.length} 首到「${playlist?.name}」`)
        setOpen(false)
        onComplete?.()
    }

    const handleCreateAndAdd = () => {
        if (newName.trim()) {
            const id = createPlaylist(newName.trim())
            addManyToPlaylist(songs, id)
            toast.success(`已创建并添加 ${songs.length} 首到「${newName.trim()}」`)
            setNewName('')
            setShowNewInput(false)
            setOpen(false)
            onComplete?.()
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
                <div className="text-sm font-medium text-muted-foreground mb-2 px-2">
                    添加 {songs.length} 首到歌单
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                    {playlists.map((playlist) => (
                        <button
                            key={playlist.id}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                            onClick={() => handleAddToPlaylist(playlist.id)}
                        >
                            <FolderHeart className="h-4 w-4 shrink-0" />
                            <span className="flex-1 text-left truncate">{playlist.name}</span>
                        </button>
                    ))}
                </div>

                <div className="border-t mt-2 pt-2">
                    {showNewInput ? (
                        <div className="flex items-center gap-1">
                            <Input
                                placeholder="歌单名称"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateAndAdd()
                                    if (e.key === 'Escape') setShowNewInput(false)
                                }}
                            />
                            <Button size="sm" className="h-8" onClick={handleCreateAndAdd} disabled={!newName.trim()}>
                                添加
                            </Button>
                        </div>
                    ) : (
                        <button
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            onClick={() => setShowNewInput(true)}
                        >
                            <Plus className="h-4 w-4" />
                            新建歌单
                        </button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

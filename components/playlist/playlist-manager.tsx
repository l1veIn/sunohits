'use client'

import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Check, X, FolderHeart, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useFavoritesStore, Playlist, DEFAULT_PLAYLIST_ID } from '@/lib/store/use-favorites-store'
import { cn } from '@/lib/utils'

interface PlaylistCardProps {
    playlist: Playlist
    isSelected: boolean
    songCount: number
    onSelect: () => void
    onRename?: (name: string) => void
    onDelete?: () => void
    onExport?: () => void
}

function PlaylistCard({
    playlist,
    isSelected,
    songCount,
    onSelect,
    onRename,
    onDelete,
    onExport
}: PlaylistCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState(playlist.name)

    const handleRename = () => {
        if (editName.trim() && editName !== playlist.name) {
            onRename?.(editName.trim())
        }
        setIsEditing(false)
    }

    return (
        <div
            className={cn(
                "flex flex-col p-3 rounded-xl border cursor-pointer transition-all",
                "hover:bg-accent/50 hover:border-primary/50",
                isSelected && "bg-accent border-primary"
            )}
            onClick={onSelect}
        >
            <div className="flex items-center gap-2 mb-2">
                <FolderHeart className="h-5 w-5 text-primary" />
                {isEditing ? (
                    <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                        <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename()
                                if (e.key === 'Escape') setIsEditing(false)
                            }}
                        />
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleRename}>
                            <Check className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditing(false)}>
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ) : (
                    <span className="font-medium text-sm truncate flex-1">{playlist.name}</span>
                )}
            </div>
            <div className="flex items-center justify-between h-6">
                <span className="text-xs text-muted-foreground">{songCount} 首</span>
                {!isEditing && (
                    <div className="flex items-center gap-1">
                        {/* Export button - always show */}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.stopPropagation()
                                onExport?.()
                            }}
                            title="导出歌单"
                        >
                            <Download className="h-3 w-3" />
                        </Button>
                        {/* Edit/Delete buttons - only for non-default */}
                        {!playlist.isDefault && (
                            <>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setEditName(playlist.name)
                                        setIsEditing(true)
                                    }}
                                >
                                    <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete?.()
                                    }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

interface PlaylistManagerProps {
    selectedPlaylistId: string
    onSelectPlaylist: (id: string) => void
}

export function PlaylistManager({ selectedPlaylistId, onSelectPlaylist }: PlaylistManagerProps) {
    const { playlists, playlistSongs, songs, createPlaylist, renamePlaylist, deletePlaylist, addManyToPlaylist } = useFavoritesStore()

    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [newPlaylistName, setNewPlaylistName] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)

    const handleCreate = () => {
        if (newPlaylistName.trim()) {
            const id = createPlaylist(newPlaylistName.trim())
            onSelectPlaylist(id)
            setNewPlaylistName('')
            setShowCreateDialog(false)
        }
    }

    const handleDelete = (keepSongs: boolean) => {
        if (deleteConfirm) {
            deletePlaylist(deleteConfirm.id, keepSongs)
            if (selectedPlaylistId === deleteConfirm.id) {
                onSelectPlaylist(DEFAULT_PLAYLIST_ID)
            }
            setDeleteConfirm(null)
        }
    }

    // Import state
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showImportDialog, setShowImportDialog] = useState(false)
    const [importData, setImportData] = useState<{ name: string; songs: any[] } | null>(null)
    const [importName, setImportName] = useState('')

    // Export playlist to JSON
    const handleExport = (playlistId: string) => {
        const playlist = playlists.find(p => p.id === playlistId)
        if (!playlist) return

        const playlistBvids = playlistSongs[playlistId] || []
        const playlistSongsData = playlistBvids.map(bvid => songs[bvid]).filter(Boolean)

        const exportData = {
            name: playlist.name,
            exportedAt: new Date().toISOString(),
            songs: playlistSongsData
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${playlist.name}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Handle file selection for import
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string)
                if (data.songs && Array.isArray(data.songs)) {
                    setImportData({ name: data.name || '导入的歌单', songs: data.songs })
                    setImportName(data.name || '导入的歌单')
                    setShowImportDialog(true)
                }
            } catch (err) {
                console.error('Failed to parse import file', err)
            }
        }
        reader.readAsText(file)
        // Reset input
        e.target.value = ''
    }

    // Confirm import
    const handleImport = () => {
        if (!importData || !importName.trim()) return

        const id = createPlaylist(importName.trim())
        addManyToPlaylist(importData.songs, id)
        onSelectPlaylist(id)
        setShowImportDialog(false)
        setImportData(null)
        setImportName('')
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">我的歌单</h2>
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-1" />
                        导入
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        新建歌单
                    </Button>
                </div>
            </div>

            {/* Playlist grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {playlists.map((playlist) => (
                    <div key={playlist.id} className="group">
                        <PlaylistCard
                            playlist={playlist}
                            isSelected={selectedPlaylistId === playlist.id}
                            songCount={(playlistSongs[playlist.id] || []).length}
                            onSelect={() => onSelectPlaylist(playlist.id)}
                            onRename={(name) => renamePlaylist(playlist.id, name)}
                            onDelete={() => setDeleteConfirm({ id: playlist.id, name: playlist.name })}
                            onExport={() => handleExport(playlist.id)}
                        />
                    </div>
                ))}
            </div>

            {/* Create playlist dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>新建歌单</DialogTitle>
                        <DialogDescription>
                            为你的新歌单起一个名字
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="歌单名称"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreate()
                        }}
                        autoFocus
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            取消
                        </Button>
                        <Button onClick={handleCreate} disabled={!newPlaylistName.trim()}>
                            创建
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>删除歌单「{deleteConfirm?.name}」？</AlertDialogTitle>
                        <AlertDialogDescription>
                            你可以选择将歌曲保留到默认收藏夹，或者彻底删除。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(true)}>
                            保留歌曲
                        </AlertDialogAction>
                        <AlertDialogAction
                            onClick={() => handleDelete(false)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            彻底删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Import confirmation */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>导入歌单</DialogTitle>
                        <DialogDescription>
                            将导入 {importData?.songs.length || 0} 首歌曲，请为歌单命名
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="歌单名称"
                        value={importName}
                        onChange={(e) => setImportName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleImport()
                        }}
                        autoFocus
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                            取消
                        </Button>
                        <Button onClick={handleImport} disabled={!importName.trim()}>
                            导入
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

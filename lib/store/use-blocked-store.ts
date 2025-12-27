import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface BlockedStore {
    blockedBvids: string[]
    isBlocked: (bvid: string) => boolean
    block: (bvid: string) => void
    unblock: (bvid: string) => void
}

// Migrate old storage format if needed
if (typeof window !== 'undefined') {
    try {
        const stored = localStorage.getItem('blocked-videos')
        if (stored) {
            const data = JSON.parse(stored)
            // Check for old Set format (empty object {} or object with values property)
            if (data?.state?.blockedBvids && !Array.isArray(data.state.blockedBvids)) {
                if (data.state.blockedBvids.values && Array.isArray(data.state.blockedBvids.values)) {
                    // Migrate from { values: [...] } to [...]
                    data.state.blockedBvids = data.state.blockedBvids.values
                    localStorage.setItem('blocked-videos', JSON.stringify(data))
                } else {
                    // Corrupted data, reset
                    localStorage.removeItem('blocked-videos')
                }
            }
        }
    } catch {
        // If parsing fails, remove corrupted data
        localStorage.removeItem('blocked-videos')
    }
}

export const useBlockedStore = create<BlockedStore>()(
    persist(
        (set, get) => ({
            blockedBvids: [],

            isBlocked: (bvid) => get().blockedBvids.includes(bvid),

            block: (bvid) => {
                const current = get().blockedBvids
                if (!current.includes(bvid)) {
                    set({ blockedBvids: [...current, bvid] })
                }
            },

            unblock: (bvid) => {
                set({ blockedBvids: get().blockedBvids.filter(b => b !== bvid) })
            },
        }),
        {
            name: 'blocked-videos',
            storage: createJSONStorage(() => localStorage),
        }
    )
)

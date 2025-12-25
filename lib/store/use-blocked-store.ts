import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'

interface BlockedStore {
    blockedBvids: Set<string>
    isBlocked: (bvid: string) => boolean
    block: (bvid: string) => void
    unblock: (bvid: string) => void
}

// Custom storage with Set serialization
const customStorage: StateStorage = {
    getItem: (name) => {
        const str = localStorage.getItem(name)
        if (!str) return null
        const data = JSON.parse(str)
        if (data?.state?.blockedBvids?.values) {
            data.state.blockedBvids = new Set(data.state.blockedBvids.values)
        }
        return JSON.stringify(data)
    },
    setItem: (name, value) => {
        const data = JSON.parse(value)
        if (data?.state?.blockedBvids instanceof Set) {
            data.state.blockedBvids = { values: Array.from(data.state.blockedBvids) }
        }
        localStorage.setItem(name, JSON.stringify(data))
    },
    removeItem: (name) => localStorage.removeItem(name),
}

export const useBlockedStore = create<BlockedStore>()(
    persist(
        (set, get) => ({
            blockedBvids: new Set<string>(),

            isBlocked: (bvid) => get().blockedBvids.has(bvid),

            block: (bvid) => {
                const newSet = new Set(get().blockedBvids)
                newSet.add(bvid)
                set({ blockedBvids: newSet })
            },

            unblock: (bvid) => {
                const newSet = new Set(get().blockedBvids)
                newSet.delete(bvid)
                set({ blockedBvids: newSet })
            },
        }),
        {
            name: 'blocked-videos',
            storage: createJSONStorage(() => customStorage),
        }
    )
)

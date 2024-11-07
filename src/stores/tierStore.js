import { writable } from 'svelte/store';

// Define default tiers as a constant that can be imported and reused
export const DEFAULT_TIERS = [
  { id: 'S', label: 'S', color: 'from-red-600 to-red-700', textColor: 'text-white', items: [] },
  { id: 'A', label: 'A', color: 'from-orange-500 to-orange-600', textColor: 'text-white', items: [] },
  { id: 'B', label: 'B', color: 'from-yellow-400 to-yellow-500', textColor: 'text-black', items: [] },
  { id: 'C', label: 'C', color: 'from-green-500 to-green-600', textColor: 'text-white', items: [] },
  { id: 'D', label: 'D', color: 'from-blue-500 to-blue-600', textColor: 'text-white', items: [] },
  { id: 'F', label: 'F', color: 'from-purple-600 to-purple-700', textColor: 'text-white', items: [] }
];

function createTierStore() {
  // Initialize with default tiers immediately
  const { subscribe, set, update } = writable(DEFAULT_TIERS);

  return {
    subscribe,
    set,
    addTier: (tier) => update(tiers => [...tiers, tier]),
    removeTier: (tierId) => update(tiers => tiers.filter(t => t.id !== tierId)),
    updateTierItems: (tierId, items) => update(tiers =>
      tiers.map(t => t.id === tierId ? { ...t, items } : t)
    ),
    updateTierLabel: (tierId, label) => update(tiers =>
      tiers.map(t => t.id === tierId ? { ...t, label } : t)
    ),
    updateTierColor: (tierId, gradient, textColor) => update(tiers =>
      tiers.map(t => t.id === tierId ? { ...t, color: gradient, textColor } : t)
    ),
    reset: () => set(DEFAULT_TIERS) // Reset to default tiers instead of empty array
  };
}

export const tierStore = createTierStore();

import { writable } from 'svelte/store';

function createContentStore() {
  const { subscribe, set, update } = writable({
    items: [],
    selectedItems: []
  });

  return {
    subscribe,
    importList: (list) => update(state => ({
      ...state,
      items: [...state.items, ...list]
    })),
    updateContent: (content) => update(state => ({
      ...state,
      items: content
    })),
    selectItem: (item) => update(state => ({
      ...state,
      selectedItems: [...state.selectedItems, item]
    })),
    reset: () => set({ items: [], selectedItems: [] })
  };
}

export const contentStore = createContentStore();

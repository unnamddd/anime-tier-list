import { writable } from 'svelte/store';

function createThemeStore() {
  const { subscribe, set } = writable({
    currentTheme: '',
    categories: []
  });

  return {
    subscribe,
    setTheme: (theme) => set({ currentTheme: theme, categories: [] }),
    updateCategories: (categories) => set(state => ({
      ...state,
      categories
    }))
  };
}

export const themeStore = createThemeStore();

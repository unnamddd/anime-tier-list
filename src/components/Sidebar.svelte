<script>
  import { onMount } from 'svelte';
  import { themeStore } from '../stores/themeStore';
  import { contentStore } from '../stores/contentStore';

  let selectedTheme = '';
  let importUrl = '';
  let loading = false;

  async function importAnimeList() {
    if (!importUrl) return;
    
    loading = true;
    try {
      // Using Jikan API for MyAnimeList integration
      const username = importUrl.split('/').pop();
      const response = await fetch(`https://api.jikan.moe/v4/users/${username}/animelist`);
      const data = await response.json();
      
      contentStore.importList(data.data);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      loading = false;
    }
  }

  async function handleThemeChange(theme) {
    selectedTheme = theme;
    loading = true;
    
    try {
      // Using AniList API for content fetching
      const query = `
        query ($type: MediaType) {
          Media (type: $type) {
            characters {
              nodes {
                id
                name {
                  full
                }
                image {
                  medium
                }
              }
            }
          }
        }
      `;

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            type: 'ANIME'
          }
        })
      });

      const data = await response.json();
      contentStore.updateContent(data);
    } catch (error) {
      console.error('Theme change failed:', error);
    } finally {
      loading = false;
    }
  }
</script>

<div class="p-4 h-full dark:bg-gray-900 dark:text-white">
  <h2 class="text-xl font-bold mb-4">Settings</h2>
  
  <div class="mb-6">
    <h3 class="font-semibold mb-2">Import Anime List</h3>
    <input
      type="text"
      bind:value={importUrl}
      placeholder="MyAnimeList/AniList URL"
      class="w-full p-2 border-gray-500 border-2 dark:bg-gray-700 rounded mb-2"
    />
    <button
      on:click={importAnimeList}
      disabled={loading}
      class="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
    >
      {loading ? 'Importing...' : 'Import'}
    </button>
  </div>

  <div class="mb-6">
    <h3 class="font-semibold mb-2 ">Theme</h3>
    <select
      bind:value={selectedTheme}
      on:change={() => handleThemeChange(selectedTheme)}
      class="w-full p-2 border-gray-500 border-2 rounded dark:bg-gray-700"
    >
      <option value="">Select a theme</option>
      <option value="neko">Neko Characters</option>
      <option value="elves">Elves</option>
      <option value="crime">Crime Anime</option>
      <option value="mecha">Mecha</option>
    </select>
  </div>
</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import { contentStore } from '../stores/contentStore';
  import { themeStore } from '../stores/themeStore';
  import debounce from 'lodash/debounce';
  import { dndzone } from 'svelte-dnd-action';
  
  let searchQuery = '';
  let isLoading = false;
  let error = null;
  let contents = [];
  let filteredContents = [];
  let selectedCategories = [];
  let availableCategories = [];
  let viewMode: 'grid' | 'list' = 'grid';
  let sortBy: 'name' | 'popularity' | 'recent' = 'name';
  
  // Subscribe to stores
  $: {
    contents = $contentStore.items;
    updateFilteredContents();
  }
  
  $: {
    availableCategories = $themeStore.categories;
  }
  
  // Filter and sort contents based on search, categories, and sort option
  function updateFilteredContents() {
    let filtered = [...contents];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.anime?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item =>
        selectedCategories.every(category => 
          item.categories?.includes(category)
        )
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'recent':
          return new Date(b.addedAt) - new Date(a.addedAt);
        default:
          return 0;
      }
    });
    
    filteredContents = filtered;
  }
  
  // Debounced search handler
  const handleSearch = debounce(() => {
    updateFilteredContents();
  }, 300);
  
  function toggleCategory(category) {
    const index = selectedCategories.indexOf(category);
    if (index === -1) {
      selectedCategories = [...selectedCategories, category];
    } else {
      selectedCategories = selectedCategories.filter(c => c !== category);
    }
    updateFilteredContents();
  }
  
  function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', JSON.stringify(event.detail));
  }
  
  // Load initial data
  onMount(async () => {
    try {
      isLoading = true;
      const response = await fetch('/api/content/initial');
      const data = await response.json();
      contentStore.updateContent(data);
    } catch (e) {
      error = e.message;
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="content-panel h-full flex flex-col">
  <!-- Search and Filters Header -->
  <div class="p-4 border-b">
    <div class="mb-4">
      <input
        type="text"
        bind:value={searchQuery}
        on:input={handleSearch}
        placeholder="Search content..."
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    
    <div class="flex flex-wrap gap-2 mb-4">
      {#each availableCategories as category}
        <button
          class="px-3 py-1 rounded-full text-sm {selectedCategories.includes(category) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
          on:click={() => toggleCategory(category)}
        >
          {category}
        </button>
      {/each}
    </div>
    
    <div class="flex justify-between items-center">
      <!-- View Mode Toggle -->
      <div class="flex gap-2">
        <button
          class="p-2 rounded {viewMode === 'grid' ? 'bg-blue-100' : 'bg-gray-100'}"
          on:click={() => viewMode = 'grid'}
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 4h4v4H4V4z M12 4h4v4h-4V4z M20 4h-4v4h4V4z"/>
            <path d="M4 12h4v4H4v-4z M12 12h4v4h-4v-4z M20 12h-4v4h4v-4z"/>
            <path d="M4 20h4v-4H4v4z M12 20h4v-4h-4v4z M20 20h-4v-4h4v4z"/>
          </svg>
        </button>
        <button
          class="p-2 rounded {viewMode === 'list' ? 'bg-blue-100' : 'bg-gray-100'}"
          on:click={() => viewMode = 'list'}
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
      
      <!-- Sort Dropdown -->
      <select
        bind:value={sortBy}
        class="px-3 py-2 border rounded-lg"
        on:change={updateFilteredContents}
      >
        <option value="name">Name</option>
        <option value="popularity">Popularity</option>
        <option value="recent">Recently Added</option>
      </select>
    </div>
  </div>
  
  <!-- Content Grid/List -->
  <div class="flex-1 overflow-y-auto p-4">
    {#if isLoading}
      <div class="flex justify-center items-center h-full">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    {:else if error}
      <div class="text-red-500 text-center py-4">
        {error}
      </div>
    {:else}
      <div class={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4' : 'space-y-2'}>
        {#each filteredContents as item (item.id)}
          <div
            class={viewMode === 'grid' 
              ? 'relative group cursor-move bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'
              : 'flex items-center space-x-4 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-move'
            }
            draggable="true"
            on:dragstart={handleDragStart}
            data-item={JSON.stringify(item)}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              class={viewMode === 'grid'
                ? 'w-full h-40 object-cover rounded-t-lg'
                : 'w-16 h-16 object-cover rounded'
              }
            />
            <div class={viewMode === 'grid' ? 'p-2' : 'flex-1'}>
              <h3 class="font-medium text-gray-900">{item.name}</h3>
              {#if item.anime}
                <p class="text-sm text-gray-500">{item.anime}</p>
              {/if}
              {#if viewMode === 'list'}
                <div class="flex flex-wrap gap-1 mt-1">
                  {#each item.categories || [] as category}
                    <span class="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                      {category}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  /* Hide scrollbar for Chrome, Safari and Opera */
  .overflow-y-auto::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  .overflow-y-auto {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  
  /* Optional: Add custom transitions for draggable items */
  [draggable="true"] {
    transition: transform 0.2s;
  }
  
  [draggable="true"]:active {
    transform: scale(0.95);
  }
</style>

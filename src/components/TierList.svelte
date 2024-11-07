<script lang="ts">
  import { onMount } from 'svelte';
  import { tierStore, DEFAULT_TIERS } from '../stores/tierStore';
  import { flip } from 'svelte/animate';
  import { dndzone } from 'svelte-dnd-action';
  import html2canvas from 'html2canvas';

  let tiers = [];
  let editingTierId = null;
  let editingLabel = '';
  let colorPickerVisible = false;
  let selectedTierId = null;
  
  // Predefined color options with gradients
  const COLOR_OPTIONS = [
    { id: 'red', gradient: 'from-red-600 to-red-700', textColor: 'text-white' },
    { id: 'orange', gradient: 'from-orange-500 to-orange-600', textColor: 'text-white' },
    { id: 'yellow', gradient: 'from-yellow-400 to-yellow-500', textColor: 'text-black' },
    { id: 'green', gradient: 'from-green-500 to-green-600', textColor: 'text-white' },
    { id: 'blue', gradient: 'from-blue-500 to-blue-600', textColor: 'text-white' },
    { id: 'indigo', gradient: 'from-indigo-500 to-indigo-600', textColor: 'text-white' },
    { id: 'purple', gradient: 'from-purple-600 to-purple-700', textColor: 'text-white' },
    { id: 'pink', gradient: 'from-pink-500 to-pink-600', textColor: 'text-white' }
  ];
  
  // Subscribe to store
  tierStore.subscribe(value => {
    tiers = value;
  });

  onMount(() => {
    // No need to check for empty tiers as store is initialized with defaults
    // But we can reset to ensure we have the default state
    tierStore.reset();
  });

  function handleDndConsider(e) {
    const { items } = e.detail;
    tierStore.updateTierItems(e.currentTarget.dataset.tierId, items);
  }

  function handleDndFinalize(e) {
    const { items } = e.detail;
    tierStore.updateTierItems(e.currentTarget.dataset.tierId, items);
  }

  function addTier() {
    const newTier = {
      id: `tier-${Date.now()}`,
      label: 'New Tier',
      color: COLOR_OPTIONS[0].gradient,
      textColor: COLOR_OPTIONS[0].textColor,
      items: []
    };
    tierStore.addTier(newTier);
  }

  function removeTier(tierId) {
    tierStore.removeTier(tierId);
  }

  function startEditingLabel(tierId, currentLabel) {
    editingTierId = tierId;
    editingLabel = currentLabel;
  }

  function saveLabel() {
    if (editingTierId) {
      tierStore.updateTierLabel(editingTierId, editingLabel);
      editingTierId = null;
    }
  }

  function showColorPicker(tierId) {
    selectedTierId = tierId;
    colorPickerVisible = true;
  }

  function selectColor(colorOption) {
    if (selectedTierId) {
      tierStore.updateTierColor(selectedTierId, colorOption.gradient, colorOption.textColor);
      colorPickerVisible = false;
      selectedTierId = null;
    }
  }

  async function exportAsImage() {
    try {
      const tierListElement = document.getElementById('tier-list');
      const canvas = await html2canvas(tierListElement, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = 'tierlist.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting tier list:', error);
    }
  }
</script>

<div class="tier-list-container bg-black min-h-screen p-4">
  <div class="max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <button 
        on:click={addTier}
        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
      >
        Add Tier
      </button>
      
      <button 
        on:click={exportAsImage}
        class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
      >
        Export as Image
      </button>
    </div>

    <div id="tier-list" class="space-y-2 p-2">
      {#each tiers as tier (tier.id)}
        <div animate:flip class="tier-row flex rounded-lg overflow-hidden">
          <div 
            class="tier-label w-24 flex items-center justify-center bg-gradient-to-r {tier.color} {tier.textColor} relative group"
          >
            {#if editingTierId === tier.id}
              <input
                type="text"
                bind:value={editingLabel}
                on:blur={saveLabel}
                on:keydown={(e) => e.key === 'Enter' && saveLabel()}
                class="w-16 text-center bg-transparent border-b border-white outline-none"
              />
            {:else}
              <span 
                on:dblclick={() => startEditingLabel(tier.id, tier.label)}
                class="text-xl font-bold"
              >
                {tier.label}
              </span>
            {/if}
            
            <button 
              on:click={() => showColorPicker(tier.id)}
              class="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 2h16l-3 9H7L4 2zm13 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>
          
          <div 
            class="tier-content flex-1 min-h-[120px] bg-gray-800 p-2 flex flex-wrap gap-2"
            use:dndzone={{items: tier.items}}
            data-tier-id={tier.id}
            on:consider={handleDndConsider}
            on:finalize={handleDndFinalize}
          >
            {#each tier.items as item (item.id)}
              <div class="item w-24 h-24 relative group">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  class="w-full h-full object-cover rounded shadow-lg"
                />
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span class="text-white text-sm text-center px-1">{item.name}</span>
                </div>
              </div>
            {/each}
          </div>
          
          <button 
            on:click={() => removeTier(tier.id)}
            class="px-2 bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center"
          >
            ×
          </button>
        </div>
      {/each}
    </div>

    {#if colorPickerVisible}
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-4 max-w-md w-full">
          <h3 class="text-lg font-bold mb-4">Select Color</h3>
          <div class="grid grid-cols-4 gap-2">
            {#each COLOR_OPTIONS as option}
              <button
                class="w-full h-12 rounded bg-gradient-to-r {option.gradient} {option.textColor} hover:opacity-90 transition-opacity"
                on:click={() => selectColor(option)}
              >
                <span class="sr-only">Select {option.id} color</span>
              </button>
            {/each}
          </div>
          <button
            class="mt-4 w-full py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            on:click={() => {colorPickerVisible = false; selectedTierId = null;}}
          >
            Cancel
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .tier-content {
    transition: min-height 0.2s ease;
  }
  
  .tier-content:empty {
    min-height: 120px;
  }
  
  .tier-row {
    transition: transform 0.2s ease;
  }
  
  .tier-row:hover {
    transform: translateX(4px);
  }
  
  .item {
    transition: transform 0.15s ease;
  }
  
  .item:hover {
    transform: scale(1.05);
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #1a1a1a;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #5a5a5a;
  }
</style>

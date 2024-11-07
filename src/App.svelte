<script>
  import { onMount } from 'svelte';
  import TierList from './components/TierList.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import ContentPanel from './components/ContentPanel.svelte';
  import { tierStore } from './stores/tierStore';
  import { contentStore } from './stores/contentStore';
  import { themeStore } from './stores/themeStore';

  let loading = false;
  let error = null;
</script>

<main class="flex h-screen bg-gray-100">
  <div class="flex-1 p-4">
    <TierList />
  </div>
  <div class="w-80 bg-white border-l border-gray-200">
    <Sidebar />
  </div>
</main>

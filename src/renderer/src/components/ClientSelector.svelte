<script>
  import { onMount, onDestroy } from 'svelte'

  // Default is in Updater.svelte
  export let selectedClient = ''
  let isOpen = false
  let triggerEl
  let selectedEl
  let dropdownEl
  let dropdownStyle = ''
  let clientsList = {}

  function toggle() {
    if (isOpen) {
      isOpen = false
      selectedEl.classList.remove('active')
      return
    }

    // Calculate position
    const rect = triggerEl.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    const dropdownHeight = Object.keys(clientsList).length * triggerEl.offsetHeight + 8
    const openUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

    dropdownStyle = `
      position: fixed;
      top: ${openUpwards ? rect.top - dropdownHeight - 4 : rect.bottom + 4}px;
      left: ${rect.left}px;
      width: ${rect.width - 8}px;
      max-height: ${dropdownHeight}px;
    `

    isOpen = true
    selectedEl.classList.add('active')
  }

  function selectClient(client) {
    selectedClient = client
    isOpen = false
    selectedEl.classList.remove('active')
  }

  function handleOutsideClick(event) {
    if (!triggerEl.contains(event.target) && !dropdownEl?.contains(event.target)) {
      isOpen = false
      selectedEl.classList.remove('active')
    }
  }

  onMount(async () => {
    window.addEventListener('click', handleOutsideClick)
    clientsList = await window.api.getConfig('CLIENTS')
  })

  onDestroy(() => {
    window.removeEventListener('click', handleOutsideClick)
  })
</script>

<div class="dropdown" bind:this={triggerEl}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="dropdown-selected" bind:this={selectedEl} on:click={toggle}>
    {selectedClient}
  </div>
</div>

{#if isOpen}
  <div class="dropdown-list" bind:this={dropdownEl} style={dropdownStyle}>
    {#each Object.keys(clientsList) as client (client)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="dropdown-item {selectedClient === client ? 'selected' : ''}"
        on:click={() => selectClient(client)}
      >
        {client}
      </div>
    {/each}
  </div>
{/if}

<style>
  .dropdown {
    position: relative;
    width: 160px;
    font-family: sans-serif;
    user-select: none;
  }

  .dropdown-selected {
    padding: 4px 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: none;

    border-width: 4px;
    border-style: solid;
    border-image-source: url('../assets/images/button_normal.png');
    border-image-slice: 4 fill;
    border-image-repeat: repeat;
  }

  .dropdown-selected:hover {
    border-image-source: url('../assets/images/button_hover.png');
    background: url('../assets/images/button_hover.png') center/100% 100% stretch;
  }

  :global(.dropdown-selected.active) {
    border-image-source: url('../assets/images/button_hover.png');
    background: url('../assets/images/button_hover.png') center/100% 100% stretch;
  }

  .dropdown-list {
    border-width: 4px;
    border-style: solid;
    border-image-source: url('../assets/images/button_normal.png');
    border-image-slice: 4 fill;
    border-image-repeat: repeat;
    overflow-y: auto;
    z-index: 9999;
  }

  .dropdown-item {
    padding: 4px 8px;
    border-width: 4px;
    border-style: solid;
    border-color: transparent;
    cursor: pointer;
  }

  .dropdown-item:hover {
    border-width: 4px;
    border-style: solid;
    border-image-source: url('../assets/images/button_hover.png');
    border-image-slice: 4 fill;
    border-image-repeat: repeat;
  }

  .dropdown-item.selected {
    background: url('../assets/images/button_hover.png') center/100% 100% stretch;
  }
</style>

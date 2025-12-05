<script>
  import { onMount } from 'svelte'
  import NewsEntry from './NewsEntry.svelte'

  let news = []
  let loading = true

  onMount(async () => {
    try {
      const url = await window.api.getConfig('API_URL')
      const response = await fetch(`${url}/launcher/news`)
      if (!response.ok) throw new Error('Failed to fetch news')

      news = await response.json()
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      loading = false
    }
  })
</script>

<div class="news-panel">
  <div class="title">News</div>
  <div class="separator"><div></div></div>
  <div class="content">
    {#if loading}
      <div>Loading...</div>
    {:else if news.length === 0}
      <div>No news available.</div>
    {:else}
      {#each news as entry (entry.link)}
        <NewsEntry type={entry.type} title={entry.title} date={entry.date} link={entry.link} />
      {/each}
    {/if}
  </div>
</div>

<style>
  .news-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    min-height: 0;
  }

  .title {
    height: 21px;
    text-align: center;

    background-image: url('../assets/images/panel_header_bg.png');

    border: 3px solid transparent;
    border-image: url('../assets/images/panel_header_border.png') 3 repeat;
    box-sizing: border-box;
  }

  .separator {
    margin: 0 -5px;
    margin-top: -2px;
    z-index: 1;
    height: 6px;

    border-width: 2px 12px 4px 12px;
    border-style: solid;
    border-color: transparent;
    border-image: url('../assets/images/separator_border.png') 2 12 4 12 repeat;

    & > div {
      height: 6px;
      margin: 0px -5px;

      background-image: url('../assets/images/separator_bg.png');
    }
  }

  .content {
    margin-top: -5px;
    flex: 1;
    overflow-y: auto;

    background-image: url('../assets/images/panel_bg.png');
    border: 4px solid transparent;
    border-image: url('../assets/images/panel_border.png') 4 repeat;
    box-sizing: border-box;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-button {
      display: none;
      width: 0;
      height: 0;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #f2af4e, #ff9f18);
      border-radius: 8px;
    }
  }
</style>

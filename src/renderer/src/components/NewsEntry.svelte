<script>
  export let type = ''
  export let title = ''
  export let date = ''
  export let link = '#'
</script>

<a href=".#" on:click|preventDefault={() => window.api.openExternal(link)}>
  <span class="type">{type}</span>
  <span class="title">{title}</span>
  <span class="date">{date}</span>
</a>

<style>
  a {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-decoration: none;
    padding: 8px;

    background: linear-gradient(90deg, #00000066, #00000000);

    &:hover {
      background: linear-gradient(90deg, #ffffff11, #ffffff00);
    }
  }

  .type {
    color: #888888;
    width: 80px;
  }

  .title {
    color: #ffffff;
    flex-grow: 1;
  }

  .date {
    color: #888888;
  }
</style>

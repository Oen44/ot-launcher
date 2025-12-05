<script>
  import Logo from './components/Logo.svelte'
  import Socials from './components/Socials.svelte'
  import NewsPanel from './components/NewsPanel.svelte'
  import Updater from './components/Updater.svelte'
  import CloseButton from './components/CloseButton.svelte'
</script>

<Logo />
<div class="container">
  <CloseButton />
  <Socials />
  <NewsPanel />
  <Updater />
</div>

<style>
  .container {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 10px 20px;
    height: calc(100vh - var(--logo-height) + var(--logo-margin));
  }
</style>

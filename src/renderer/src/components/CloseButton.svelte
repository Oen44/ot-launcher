<script>
  import Button from './Button.svelte'
</script>

<Button className="close-button" label="X" onClick={() => window.api.close()} />

<style>
  :global(.close-button) {
    position: absolute;
    right: 0;
    top: calc(var(--logo-margin) + 10px);
    font-size: 14px;
  }
</style>

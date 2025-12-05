<script>
  export let className = ''
  export let style = ''
  export let label = 'Button'
  export let disabled = false
  export let onClick = () => {}
</script>

<button class={className} {style} {disabled} on:click={onClick}>
  {label}
</button>

<style>
  button {
    height: 32px;
    padding: 0 8px;

    background: none;

    display: inline-flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    user-select: none;
    outline: none;

    border-width: 4px;
    border-style: solid;
    border-image-source: url('../assets/images/button_normal.png');
    border-image-slice: 4 fill;
    border-image-repeat: repeat;
  }

  button:hover:not(:disabled) {
    border-image-source: url('../assets/images/button_hover.png');
    background: url('../assets/images/button_hover.png') center/100% 100% stretch;
  }

  button:disabled {
    border-image-source: url('../assets/images/button_disabled.png');
    background: url('../assets/images/button_disabled.png') center/100% 100% stretch;

    color: #272727;
    cursor: not-allowed;
  }

  button:focus-visible {
    outline: none;
  }
</style>

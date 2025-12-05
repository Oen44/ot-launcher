<script>
  import logoUrl from '../assets/images/logo.png'

  let logoEl
  let mouseIgnoreEl
  let canvas
  let ctx
  let start = { x: 0, y: 0 }
  let base = [0, 0]
  let ignoring = false
  let isDragging = false

  function initCanvas() {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d', { willReadFrequently: true })
    canvas.width = logoEl.naturalWidth
    canvas.height = logoEl.naturalHeight
    ctx.drawImage(logoEl, 0, 0)
  }

  async function onMouseDown(e) {
    if (!ctx) return
    e.preventDefault()

    const { offsetX, offsetY } = e
    const scaleX = logoEl.naturalWidth / logoEl.clientWidth
    const scaleY = logoEl.naturalHeight / logoEl.clientHeight
    const px = Math.floor(offsetX * scaleX)
    const py = Math.floor(offsetY * scaleY)
    const pixel = ctx.getImageData(px, py, 1, 1).data

    start = { x: e.screenX, y: e.screenY }
    base = await window.api.getPos()

    if (pixel[3] > 0) {
      isDragging = true
      window.api.setIgnore(false)
      ignoring = false
    }
  }

  function onMouseMove(e) {
    e.preventDefault()

    const rectBand = mouseIgnoreEl.getBoundingClientRect()
    const inBand = e.clientY >= rectBand.top && e.clientY <= rectBand.bottom

    let overOpaquePixel = false
    if (inBand && e.target === logoEl && ctx) {
      const rect = logoEl.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const scaleX = logoEl.naturalWidth / logoEl.clientWidth
      const scaleY = logoEl.naturalHeight / logoEl.clientHeight
      const px = Math.floor(x * scaleX)
      const py = Math.floor(y * scaleY)

      if (px >= 0 && py >= 0 && px < canvas.width && py < canvas.height) {
        const pixel = ctx.getImageData(px, py, 1, 1).data
        overOpaquePixel = pixel[3] > 20
      }
    }

    const shouldIgnore = inBand && !overOpaquePixel

    if (shouldIgnore !== ignoring) {
      ignoring = shouldIgnore
      window.api.setIgnore(ignoring)
    }

    if (isDragging) {
      const dx = e.screenX - start.x
      const dy = e.screenY - start.y
      window.api.move(dx, dy, base)
    }
  }

  function onMouseUp() {
    isDragging = false
  }

  function onMouseLeave() {
    isDragging = false
    window.api.setIgnore(false)
    ignoring = false
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={mouseIgnoreEl}
  on:mousedown={onMouseDown}
  on:mousemove={onMouseMove}
  on:mouseup={onMouseUp}
  on:mouseleave={onMouseLeave}
></div>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<img
  bind:this={logoEl}
  src={logoUrl}
  alt="Logo"
  on:load={initCanvas}
  on:mousedown={onMouseDown}
  on:mousemove={onMouseMove}
  on:mouseup={onMouseUp}
  on:mouseleave={onMouseLeave}
/>

<style>
  :root {
    --logo-width: 340px;
    --logo-height: 195px;
    --logo-margin: -60px;
  }

  div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(var(--logo-height) + var(--logo-margin));
  }

  img {
    width: var(--logo-width);
    height: var(--logo-height);
    margin-bottom: var(--logo-margin);
    z-index: 1;

    -webkit-user-select: none;
    pointer-events: auto;
    display: block;
    position: relative;
  }
</style>

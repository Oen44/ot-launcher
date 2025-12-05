import { mount } from 'svelte'

import './assets/fonts/verdana.ttf'
import './assets/fonts/verdana-bold.ttf'
import './assets/styles/main.css'

import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')
})

export default app

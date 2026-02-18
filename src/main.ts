import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'

/* Core Ionic CSS */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils from Ionic */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Ionic palette (dark mode) */
import '@ionic/vue/css/palettes/dark.system.css'

/* Theme */
import './theme/variables.css'
import './theme/global.css'

const app = createApp(App)
  .use(IonicVue, {
    mode: 'md', // Use Material Design style on all platforms for consistency
  })
  .use(router)

router.isReady().then(() => {
  app.mount('#app')
})

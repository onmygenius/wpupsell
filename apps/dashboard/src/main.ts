import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import HighchartsVue from 'highcharts-vue'
import { useAuthStore } from './stores/auth'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(HighchartsVue)

// Initialize auth state
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')

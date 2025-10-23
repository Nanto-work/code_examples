import './assets/css/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createVuestic } from 'vuestic-ui'
import JsonExcel from 'vue-json-excel3'
import 'vuestic-ui/css'

import App from './App.vue'
import router, { initializeRoutes } from '@/router'

import { loadExternalConfig } from '@/utils/request'

;(async () => {
	await loadExternalConfig()

	const app = createApp(App)

	const pinia = createPinia().use(piniaPluginPersistedstate)
	app.use(pinia)

	app.use(createVuestic())
	app.component('downloadExcel', JsonExcel)

	await initializeRoutes()
	app.use(router)

	app.mount('#app')
})()
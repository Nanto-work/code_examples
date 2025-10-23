// stores/appSettings.store.js
import { defineStore } from 'pinia'
import { getAppSettingsApi } from '@/api'
/* import appSettingsData from '@/api/appSettings.json' */

// Ключи для sessionStorage
const STORAGE_KEY = 'app_settings_cache'
const TIMESTAMP_KEY = 'app_settings_timestamp'

export const useAppSettingsStore = defineStore('appSettings', {
	state: () => ({
		settings: [],
		cacheTTL: 30 * 60 * 1000, // 30 минут
		isLoading: false,
		showSidebar: false,
		error: null
	}),
	actions: {
		async fetchSettings(force = false) {
			try {
				if (this.settings.length > 0 && !force) {
					this.isLoading = false
					return
				}
		
				this.isLoading = true
		
				if (!force && this._hasValidCache()) {
					this._loadFromCache()
					return
				}

				const response = await getAppSettingsApi()
				
				if (!response || !Array.isArray(response.appSettings)) {
					throw new Error('Некорректный формат данных appSettings');
				}
				  
				this.settings = response.appSettings

				this._saveToCache()

			} catch(err) {
				this._handleError(err)
				throw err
			} finally {
				this.isLoading = false
			}
		},
		getFirstRoute() {
			if (!this.settings || this.settings.length === 0) {
				throw new Error('Нет доступных маршрутов')
			}
			return `/${this.settings[0].name}`
		},
		// Приватные методы для работы с кэшем
		_hasValidCache() {
			const cachedData = sessionStorage.getItem(STORAGE_KEY)
			const timestamp = sessionStorage.getItem(TIMESTAMP_KEY)
			
			if (!cachedData || !timestamp) return false
			
			return (Date.now() - Number(timestamp)) < this.cacheTTL
		},
		_loadFromCache() {
			try {
				const cachedData = sessionStorage.getItem(STORAGE_KEY)
				if (cachedData) {
					this.settings = JSON.parse(cachedData)
				}
			} catch (err) {
				this._clearCache()
				throw new Error('Ошибка чтения кэша настроек')
			}
		},
		_saveToCache() {
			try {
				sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
				sessionStorage.setItem(TIMESTAMP_KEY, Date.now().toString())
			} catch (err) {
				this._clearCache()
				throw new Error('Ошибка сохранения кэша')
			}
		},
		_clearCache() {
			try {
				sessionStorage.removeItem(STORAGE_KEY)
				sessionStorage.removeItem(TIMESTAMP_KEY)
			} catch (err) {
				console.error('Ошибка очистки кэша:', err)
			}
		},
		_handleError(err) {
			this.error = err.message
			console.error('[AppSettings Store Error]', err)
		}
	}
})

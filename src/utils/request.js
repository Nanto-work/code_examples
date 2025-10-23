import axios from 'axios'
import { getToken } from '@/utils/storage'
import { useAuthStore, useNotificationsStore } from '@/stores'
import router from '@/router'

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	timeout: 60000
})

export async function loadExternalConfig() {
	try {
		const res = await fetch('/runtime-config.json', { cache: 'no-cache' })
		if (!res.ok) throw new Error('Failed to load config')

		const cfg = await res.json()
		if (cfg.API_BASE_URL && /^https?:\/\//.test(cfg.API_BASE_URL)) {
			api.defaults.baseURL = cfg.API_BASE_URL
			console.log('API baseURL overridden:', cfg.API_BASE_URL)
		}
	} catch (e) {
		console.warn('Using default API baseURL:', api.defaults.baseURL)
	}
}

api.interceptors.request.use((request) => {
	const token = getToken()

	if (token) {
		request.headers = {
			...request.headers,
			Authorization: `Bearer ${token}`
		}
	}

	return request
})

api.interceptors.response.use(
	(response) => {
		// if 200
		// ... doing something
		return Promise.resolve(response.data)
	},
	(error) => {
		// if 4xx 5xx
		const authStore = useAuthStore()
		const notificationsStore = useNotificationsStore()

		const { response } = error

		if (response?.status === 401) {
			error.hideNotification = true
			authStore.logout()
			router.push('/login?sessionExpired=1')
		} else if (response?.status === 403) {
			error.hideNotification = true;
			authStore.logout()
			router.push('/login?onlyAdmins=1')
		} else if (response?.status === 404) {
			error.hideNotification = true;
			router.push('/not-found');
			return Promise.reject(error)
		}

		if (response?.data?.status === 'error') {
			for (let key in response?.data?.data) {
				response?.data?.data[key].forEach((item) => {
					notificationsStore.addNotification({
						type: 'error',
						message: item
					})
				})
			}
			error.hideNotification = true
		}

		return Promise.reject(error)
	}
)

export default api

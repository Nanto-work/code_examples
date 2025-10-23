// stores/auth.store.js
import { defineStore } from 'pinia'
import { useNotificationsStore } from '@/stores'
import { removeToken, setToken } from '@/utils/storage'
import { loginApi } from '@/api'


export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: null
	}),
	actions: {
		async login(email, password) {
			
			const notificationsStore = useNotificationsStore()

			try {
				const res = await loginApi(email, password)
				setToken(res.token)
				this.user = res.user

			} catch(error) {
				const message = error.response?.data?.message || error.message
				notificationsStore.addNotification({ type: 'error', message })
				
				this.user = null
				
				return false
			}
		},
		async logout() {
			this.user = null
			removeToken()
		}
	},
	persist: {
		storage: localStorage
	}
})

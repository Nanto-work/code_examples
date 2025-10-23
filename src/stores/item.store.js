// stores/item.store.js
import { defineStore } from 'pinia'
import { useNotificationsStore } from '@/stores'
import { getItemApi } from '@/api'

export const useItemStore = defineStore('item', {
	state: () => ({
		itemList: null,
		itemFormat: null,
		isLoading: true,
		error: null
	}),

	actions: {
		async fetchData(endpoint, id) {
			const notificationsStore = useNotificationsStore()

			try {
				this.isLoading = true

				const res = await getItemApi(endpoint, id)
				this.itemList = res
				this.itemFormat = res.fields.map(field => ({
					value: res.data[field.name],
					title: field.title
				}))
	
			} catch(err) {
				if(err?.hideNotification !== true) {
					notificationsStore.addNotification({
						type: 'error',
						message: err.message
					})
				}
				this.error = err.message
				throw err
			} finally {
				this.isLoading = false
			}
		},
		resetState() {
			this.itemList = null
			this.itemFormat = null
			this.error = null
		}
	}
})

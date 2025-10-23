// stores/client.store.js
import { defineStore } from 'pinia'
import { useNotificationsStore } from '@/stores'
import { getItemApi, getListApi } from '@/api'
import {
	buildQuery
} from '@/utils/listQuery'

export const useClientStore = defineStore('client', {
	state: () => ({
		clientData: null,
		clientPurchases: null,
		clientPurchasesPagination: {
			currentPage: 1,
			pagesize: 15,
			totalPages: 1
		},
		clientEvents: null,
		clientEventsPagination: {
			currentPage: 1,
			pagesize: 15,
			totalPages: 1
		},
		isLoading: true,
		error: null
	}),

	actions: {
		async fetchData(id) {
			const notificationsStore = useNotificationsStore()

			try {
				this.isLoading = true

				const res = await getItemApi('clients', id)
				this.clientData = res

				await this.fetchPurchasesData()
				await this.fetchEventsData()
	
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
		async fetchPurchasesData() {
			const queryString = buildQuery({
				pagination: this.clientPurchasesPagination,
				sorting: {
					enabled: true,
					field: 'id',
					order: 'asc'
				},
				filters: {
					enabled: true,
					fields: [
						{
							"name":"client_name",
							"value": this.clientData.data.last_name,
							"enabled":true
						}
					],
				},
				search: {
					enabled: false,
					value: ''
				}
			})

			const urlWithParams = `purchases?${queryString}`
			const res = await getListApi(urlWithParams)

			this.clientPurchases = res
			this.clientPurchasesPagination = res.pagination
		},
		async fetchEventsData() {
			const queryString = buildQuery({
				pagination: this.clientEventsPagination,
				sorting: {
					enabled: true,
					field: 'id',
					order: 'asc'
				},
				filters: {
					enabled: true,
					fields: [
						{
							"name":"client_name",
							"value": this.clientData.data.last_name,
							"enabled":true
						}
					],
				},
				search: {
					enabled: false,
					value: ''
				}
			})

			const urlWithParams = `events?${queryString}`
			const res = await getListApi(urlWithParams)

			this.clientEvents = res
			this.clientEventsPagination = res.pagination
		},
		resetState() {
			this.clientData = null
			this.clientPurchases = null
			this.clientEvents = null
			this.error = null
			this.clientPurchasesPagination = {
				currentPage: 1,
				pagesize: 15,
				totalPages: 1
			}
			this.clientEventsPagination = {
				currentPage: 1,
				pagesize: 15,
				totalPages: 1
			}
		}
	}
})

// stores/form.store.js
import { defineStore } from 'pinia'
import { useNotificationsStore } from '@/stores'
import { getAddFormApi, getEditFormApi, sendFormApi, getItemApi } from '@/api'

export const useFormStore = defineStore('form', {
	state: () => ({
		orginalData: null,
		form: null,
		isMultiStep: false,
		title: null,
		isLoading: true,
		error: null
	}),
	actions: {
		async fetchAddData(endpoint) {
			const notificationsStore = useNotificationsStore()

			try {
				this.isLoading = true

				const res = await getAddFormApi(endpoint)
				this.orginalData = JSON.parse(JSON.stringify(res))
				this.form = JSON.parse(JSON.stringify(res.form))
				this.title = res.title
			} catch(err) {
				this.resetState()
				if(err?.hideNotification !== true) {
					notificationsStore.addNotification({
						type: 'error',
						message: err.message
					})
				}

				this.error = err.message
				/* throw err */
			} finally {
				this.isLoading = false
			}
		},
		async fetchEditData(endpoint, id) {
			const notificationsStore = useNotificationsStore()

			try {
				this.isLoading = true

				const res = await getEditFormApi(endpoint, id)
				this.orginalData = JSON.parse(JSON.stringify(res))
				this.form = JSON.parse(JSON.stringify(res.form))
				this.title = res.title
				
				if(this.form.name === "client_xls") {
					this.isMultiStep = true
				} else {
					this.isMultiStep = false
				}
			} catch(err) {
				this.resetState()

				if(err?.hideNotification !== true) {
					notificationsStore.addNotification({
						type: 'error',
						message: err.message
					})
				}

				this.error = err.message
				/* throw err */
			} finally {
				this.isLoading = false
			}
		},
		async submitAddForm(params, endpoint) {
			const notificationsStore = useNotificationsStore()

			try {
				this.isLoading = true

				await sendFormApi(params, endpoint)
				
				notificationsStore.addNotification({
					type: 'success',
					message: 'Успешно!'
				})
			} catch(err) {
				if(err?.hideNotification !== true) {
					notificationsStore.addNotification({
						type: 'error',
						message: err.message
					})
				}

				this.error = err.message
				/* throw err */
			} finally {
				this.isLoading = false
			}
		},
		async submitEditForm(params, endpoint, id) {
			const notificationsStore = useNotificationsStore()

			try {
				this.isLoading = true
			
				const res = await sendFormApi(params, endpoint, id)
			
				if (res.status === 'ok') {
					notificationsStore.addNotification({
						type: 'success',
						message: `Успешно! ${res.data?.status_name ?? ''}`
					})
				} else {
					notificationsStore.addNotification({
						type: 'error',
						message: res.message
					})
				}
				
				return res
			
			} finally {
				this.isLoading = false
			}
		},
		async fetchMergingData(model, id) {
			const notificationsStore = useNotificationsStore()

			try {
				const res = await getItemApi(model, id)
				return res
			} catch(err) {
				if(err?.hideNotification !== true) {
					notificationsStore.addNotification({
						type: 'error',
						message: err.message
					})
				}

				this.error = err.message
				/* throw err */
			}
		},
		resetForm() {
			this.form = JSON.parse(JSON.stringify(this.orginalData.form))
		},
		resetState() {
			this.orginalData = null
			this.form = null
			this.isMultiStep = false
			this.title = null
			this.error = null
			this.recordStatus = null
  			this.recordStatusName = null
		}
	}
})

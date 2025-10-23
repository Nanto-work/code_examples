import { defineStore } from 'pinia'
import { useNotificationsStore } from '@/stores'
import { getListApi } from '@/api'
import {
	buildQuery,
	normalizeDateFields,
	applyFilters,
	minDate,
	maxDate
} from '@/utils/listQuery'

export const useListStore = defineStore('list', {
	state: () => ({
		originalData: null,
		pagination: {
			currentPage: 1,
			pagesize: 15,
			totalPages: 1
		},
		filters: {
			enabled: true,
			fields: []
		},
		search: {
			enabled: true,
			value: ''
		},
		sorting: {
			enabled: true,
			field: 'id',
			order: 'asc'
		},
		allSelected: false,
		selectedItems: [],
		selectedActions: {
			enabled: false,
			actions: ['Delete', 'Add']
		},
		isLoading: false,
		error: null
	}),

	actions: {
		async fetchData(endpoint) {
			const notificationsStore = useNotificationsStore()

			try {
				this.isLoading = true

				const queryString = buildQuery({
					pagination: this.pagination,
					sorting: this.sorting,
					search: this.search,
					filters: this.filters
				})

				const urlWithParams = `${endpoint}?${queryString}`
				const res = await getListApi(urlWithParams)

				this.originalData = res

				this.pagination = {
					currentPage: res.pagination.currentPage,
					pagesize: res.pagination.pagesize,
					totalPages: res.pagination.totalPages
				}

				this.sorting = {
					enabled: res.settings.sorting.enabled,
					field: res.settings.sorting.field,
					order: res.settings.sorting.order
				}

				this.filters.enabled = true
				this.filters.fields = normalizeDateFields(res.settings.filters?.fields ?? [])
				this.search.enabled = res.settings.search.enabled
			} catch (err) {
				this.resetState()
				if (!err?.hideNotification) {
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

		async findData(endpoint, val) {
			const notificationsStore = useNotificationsStore()

			try {
				this.isLoading = true

				const params = {
					page: 1,
					pagesize: 5,
					sort: 'id',
					order: 'asc',
					search: val
				}

				const filters = applyFilters(this.filters.fields)
				if (this.filters.enabled && filters.length > 0) {
					params.filters = filters
				}

				const res = await getListApi(endpoint, params)
				return res
			} catch (err) {
				if (!err?.hideNotification) {
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

		async resetState() {
			this.originalData = null
			this.pagination = {
				currentPage: 1,
				pagesize: 15,
				totalPages: 1
			}
			this.filters = {
				enabled: true,
				fields: []
			}
			this.search = {
				enabled: true,
				value: ''
			}
			this.sorting = {
				enabled: true,
				field: 'id',
				order: 'asc'
			}
			this.error = null
		}
	}
})

export const dateRangeLimits = { minDate, maxDate }
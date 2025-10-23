import qs from 'qs'

export const minDate = new Date('1940-01-01T00:00:00.000Z')
export const maxDate = new Date('2029-12-31T23:59:59.999Z')

export function normalizeDateFields(fields) {
	return fields.map((field) => {
		if (field.type === 'date_range' && field.value) {
			const { start, end } = field.value
			field.dateRangeModel = {
				start: start ? new Date(start) : minDate,
				end: end ? new Date(end) : maxDate
			}
		}
		return field
	})
}

export function denormalizeDateFields(fields) {
	return fields.map((field) => {
		if (field.type === 'date_range' && field.dateRangeModel) {
			const start = field.dateRangeModel.start
			const end = field.dateRangeModel.end

			field.value = {
				start: start?.toISOString?.() === minDate.toISOString() ? null : start.toISOString(),
				end: end?.toISOString?.() === maxDate.toISOString() ? null : end.toISOString()
			}

			delete field.dateRangeModel
		}
		return field
	})
}

export function applyFilters(fields) {
	return fields
		.filter((field) => {
			if (field.type === 'date_range') {
				return !!field.dateRangeModel?.start || !!field.dateRangeModel?.end
			}

			if (field.type === 'select-multi') {
				return Array.isArray(field.value) && field.value.length > 0
			}

			return field.value !== null && field.value !== undefined && field.value !== ''
		})
		.map((field) => {
			let value = field.value

			if (field.type === 'date_range' && field.dateRangeModel) {
				const start = field.dateRangeModel.start
				const end = field.dateRangeModel.end

				value = {
					start: start?.toISOString?.() === minDate.toISOString() ? null : start?.toISOString(),
					end: end?.toISOString?.() === maxDate.toISOString() ? null : end?.toISOString(),
				}
			}

			return {
				name: field.name,
				value
			}
		})
}
export function buildQuery({ pagination, sorting, search, filters }) {
	const paramsBase = {
		page: pagination.currentPage,
		pagesize: pagination.pagesize,
		sort: sorting.field,
		order: sorting.order
	}

	if (search.enabled && search.value) {
		paramsBase.search = search.value
	}

	const activeFilters = applyFilters(filters.fields)
	let filterObj = null

	if (activeFilters.length > 0) {
		filterObj = activeFilters.reduce((acc, { name, value }) => {
			acc[name] = value
			return acc
		}, {})
	}

	const allParams = {
		...paramsBase,
		...(filterObj ? { filter: filterObj } : {})
	}

	return qs.stringify(allParams, {
		arrayFormat: 'indices',
		encodeValuesOnly: true
	})
}
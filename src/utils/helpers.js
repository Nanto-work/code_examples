export function formatLocalTime(timestamp) {
	const date = new Date(timestamp)

	// Проверка на валидность даты
	if (isNaN(date.getTime())) {
		return ''
	}

	const timeOptions = {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	}

	const dateOptions = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}

	return `${date.toLocaleTimeString(undefined, timeOptions)} ${date.toLocaleDateString(undefined, dateOptions)}`
}

export function formatLocalDate(timestamp) {
	const date = new Date(timestamp)

	// Проверка на валидность даты
	if (isNaN(date.getTime())) {
		return ''
	}

	const dateOptions = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}

	return `${date.toLocaleDateString(undefined, dateOptions)}`
}

/* export function formatShortDate(input) {
	const trimmed = input.trim()

	const parts = trimmed.split('/')
	if (parts.length !== 3) return ''

	let [day, month, year] = parts.map(p => parseInt(p, 10))
	if (isNaN(day) || isNaN(month) || isNaN(year)) return ''

	if (year < 100) {
		year += year >= 50 ? 1900 : 2000
	}

	const date = new Date(year, month - 1, day)
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return ''
	}

	const pad = n => n.toString().padStart(2, '0')
	return `${pad(day)}.${pad(month)}.${year}`
} */

export function formatPhone(raw) {
	if (!raw) return ''
	let digits = raw.replace(/\D/g, '')
	if (digits.length === 11 && digits[0] === '8') digits = '7' + digits.slice(1)
	if (digits.length !== 11 || digits[0] !== '7') return raw
	return `+7(${digits.slice(1, 4)})${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
}

export function splitByFour(str) {
	if (str == null) return ''
	return String(str).replace(/(.{4})(?=.)/g, '$1 ')
}
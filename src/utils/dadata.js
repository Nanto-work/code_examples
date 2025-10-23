import axios from 'axios'

const key = '4f75de45d33fde07e8973a9009b8f7025c46df4a'

const dadata = axios.create({
	baseURL: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs',
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		'Authorization': 'Token ' + key
	}
})

export default dadata
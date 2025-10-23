import request from '@/utils/request'

/*** AppSettings ***/
export function getAppSettingsApi() {

	return request({
		url: '/app/settings',
		method: 'get',
	})
}


export function loginApi(email, password) {

	return request({
		url: '/login',
		method: 'post',
		data: {
			'email': email,
			'password': password
		}
	})
}

/* export function getListApi(endpoint, params) {

	return request({
		url: endpoint,
		method: 'get',
		params: params
	})
} */
export function getListApi(url) {
	return request.get(url)
}

export function getItemApi(endpoint, id) {

	return request({
		url: `${endpoint}/${id}`,
		method: 'get'
	})
}

export function getAddFormApi(endpoint) {

	return request({
		url: `${endpoint}/add`,
		method: 'get'
	})
}

export function getEditFormApi(endpoint, id) {

	return request({
		url: `${endpoint}/edit/${id}`,
		method: 'get'
	})
}

export function sendFormApi(params, endpoint) {
	return request({
		url: endpoint,
		method: 'post',
		data: params
	})
}
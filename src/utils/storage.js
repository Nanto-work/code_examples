import Cookies from 'js-cookie'

const KEY_TOKEN = 'access_token'


export function getToken() {
	return Cookies.get(KEY_TOKEN)
}

export function setToken(token) {
	/* Cookies.set(KEY_TOKEN, token, { expires: 7 }) */
	Cookies.set(KEY_TOKEN, token)
}

export function removeToken() {
	return Cookies.remove(KEY_TOKEN)
}

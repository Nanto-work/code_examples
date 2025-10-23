// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAppSettingsStore } from '@/stores'
import { getToken } from '@/utils/storage'

import LoginView from '@/views/LoginView.vue'
import ModelView from '@/views/ModelView.vue'
import NotFoundModel from '@/views/NotFoundModel.vue'
import DefaultList from '@/components/default/DefaultList.vue'
import DefaultForm from '@/components/default/DefaultForm.vue'
import DefaultItem from '@/components/default/DefaultItem.vue'
import ClientItem from '@/components/clients/ClientItem.vue'

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: '/',
			name: 'root',
			meta: { public: true },
			beforeEnter: async (_to, _from, next) => {
				try {
					await initializeRoutes()
					const store = useAppSettingsStore()
					const target = store.settings.length ? `/${store.settings[0].name}` : '/not-found'
					next(target)
				} catch {
					next('/not-found')
				}
			}
		},
		{
			path: '/login',
			name: 'login',
			component: LoginView,
			meta: {
				hideUI: true,
				public: true
			}
		},
		{
			path: '/not-found',
			name: 'not-found',
			component: NotFoundModel,
			meta: {
				public: true
			}
		}
	]
})

let initPromise = null

export function initializeRoutes() {
	if (initPromise) return initPromise

	initPromise = (async () => {
		const store = useAppSettingsStore()
		await store.fetchSettings()

		store.settings.forEach((section) => {
			const base = `/${section.name}`

			router.addRoute({
				path: base,
				component: ModelView,
				props: {
					label: section.label
				},
				children: [
					{
						path: '',
						name: `${section.name}-list`,
						component: DefaultList,
						props: {
							section
						}
					},
					{
						path: ':id',
						name: `${section.name}-item`,
						component: section.name === 'clients' ? ClientItem : DefaultItem,
						props: (r) => ({
							section,
							id: r.params.id
						})
					},
					{
						path: 'add',
						name: `${section.name}-add`,
						component: DefaultForm,
						props: {
							section,
							mode: 'add'
						}
					},
					{
						path: 'edit/:id',
						name: `${section.name}-edit`,
						component: DefaultForm,
						props: (r) => ({
							section,
							mode: 'edit',
							id: r.params.id
						})
					}
				]
			})
		})
	})()

	return initPromise
}

router.beforeEach(async (to, _from, next) => {
	const token = getToken()
	const store = useAppSettingsStore()

	if (!to.meta.public && !token) return next('/login')

	try {
		await initializeRoutes()
	} catch {
		return next('/not-found')
	}

	const seg = to.path.split('/')[1]
	if (seg && seg !== 'login' && seg !== 'not-found' && !store.settings.find((s) => s.name === seg)) {
		return next('/not-found')
	}

	next()
})

router.afterEach(() => {
	const store = useAppSettingsStore()
	store.showSidebar = false
})

export default router

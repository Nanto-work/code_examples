import router from '@/router'
import { useAppSettingsStore } from '@/stores'

export function goToHome() {
	const appSettingsStore = useAppSettingsStore()
	const firstRoute = appSettingsStore.settings.length ? `/${appSettingsStore.settings[0].name}` : '/not-found'

	return router.push(firstRoute)
}
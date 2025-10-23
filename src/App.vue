<template>
	<VaLayout
		v-if="isScreenSaverActive"
		:top="{ fixed: true }"
		class="app"
	>
		<template #top>
			<VaNavbar color="primary">
				<template #center>
					<VaNavbarItem class="view-title">Trimiata</VaNavbarItem>
				</template>
			</VaNavbar>
		</template>
		<template #content>
			<ScreenSaver></ScreenSaver>
		</template>
	</VaLayout>

	<VaLayout
		v-else
		:left="{ fixed: true }"
		:top="{ fixed: true }"
		class="app"
	>
		<template #top>
			<VaNavbar color="primary">
				<template #left>
					<VaNavbarItem>
						<VaButton
							v-if="!$route.meta.hideUI"
							:icon="showSidebar ? 'menu_open' : 'menu'"
							@click="showSidebar = !showSidebar"
							preset="secondary"
							text-color="textInverted"
							hoverBehavior="mask"
							hoverMaskColor="primary"
							hoverOpacity="1"
						/>
					</VaNavbarItem>
				</template>
				<template #center>
					<VaNavbarItem class="view-title">Trimiata</VaNavbarItem>
				</template>
			</VaNavbar>
		</template>

		<template #left>
			<NavigationSidebar
				v-if="!$route.meta.hideUI"
				:items="settings"
			></NavigationSidebar>
		</template>

		<template #content>
			<router-view></router-view>
		</template>
	</VaLayout>
	<div class="notifications-wrap">
		<transition-group
			name="notifications"
			tag="div"
		>
			<VaAlert
				v-for="notification in notifications"
				:key="notification.id"
				v-model="isCloseableAlertVisible"
				:icon="notification.icon"
				:color="notification.color"
				closeable
				:description="notification.message"
			/>
		</transition-group>
	</div>
</template>

<script>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAppSettingsStore, useNotificationsStore, useScreenSaverStore } from '@/stores'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import NavigationSidebar from '@/components/NavigationSidebar.vue'
import ScreenSaver from '@/components/ScreenSaver.vue'

export default {
	name: 'App',
	components: {
		LoadingSpinner,
		NavigationSidebar,
		ScreenSaver
	},
	setup() {
		const route = useRoute()
		const appSettingsStore = useAppSettingsStore()
		const notificationsStore = useNotificationsStore()
		const screenSaverStore = useScreenSaverStore()

		const { showSidebar, settings } = storeToRefs(appSettingsStore)
		const { notifications } = storeToRefs(notificationsStore)
		const { isActive: isScreenSaverActive } = storeToRefs(screenSaverStore)
		


		const handleUserActivity = () => {
			if(!route.meta.public && !screenSaverStore.isActive) {
				screenSaverStore.resetTimer()
        		screenSaverStore.startTimer()
			}
		}

		const toggleTracking = (isPublic) => {
			if(isPublic) {
				window.removeEventListener('mousemove', handleUserActivity)
				window.removeEventListener('keydown', handleUserActivity)
				window.removeEventListener('click', handleUserActivity)
				window.removeEventListener('scroll', handleUserActivity)
				screenSaverStore.deactivate()
			} else {
				window.addEventListener('mousemove', handleUserActivity)
				window.addEventListener('keydown', handleUserActivity)
				window.addEventListener('click', handleUserActivity)
				window.addEventListener('scroll', handleUserActivity)
				screenSaverStore.startTimer()
			}
		}

		onMounted(() => {
			screenSaverStore.init()
      		appSettingsStore.fetchSettings()
      		toggleTracking(route.meta.public)
		})

		onUnmounted(() => {
			toggleTracking(true)
		})

		watch(
			() => route.meta.public,
			(newVal) => toggleTracking(newVal)
		)

		return {
			showSidebar,
			settings,
			notifications,
			isCloseableAlertVisible: true,
			isScreenSaverActive
		}
	}
}
</script>

<style lang="css">
.app {
	height: 100%;
}
.va-navbar {
	height: 52px;
	padding: 0 11px;
	background: linear-gradient(0deg, var(--va-primary), var(--primary-dark));
}
.view-title {
	font-size: 24px;
	font-weight: 700;
}
.app .va-layout__area--left .va-layout-fixed-wrapper {
	position: fixed;

	top: 52px;
	bottom: 0;
}
.app .va-layout__area--left .va-layout-fixed-wrapper .va-layout-fixed-wrapper__content {
	height: 100%;
}
.notifications-wrap {
	position: fixed;
	bottom: 0;
	right: 10px;
	width: 500px;
	padding-bottom: 10px;
}
</style>

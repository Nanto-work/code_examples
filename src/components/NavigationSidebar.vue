<template>
	<VaSidebar
		v-model="showSidebar"
		class="sidebar"
	>
		<template v-if="isLoading">
			<div class="sidebarspinner-wrap">
				<VaProgressCircle indeterminate />
			</div>
		</template>
		<template
			v-else
		>
			<router-link
				v-for="item in items"
				:key="item.name"
				:to="`/${item.name}`"
				custom
  				v-slot="{ href, isActive }"
			>
				<VaSidebarItem
					:href="href"
    				:active="isActive"
    				class="sidebar-link"
				>
					<VaSidebarItemContent>
						<VaIcon name="list_alt" />
						<VaSidebarItemTitle>{{ item.label }}</VaSidebarItemTitle>
					</VaSidebarItemContent>
				</VaSidebarItem>
			</router-link>
		</template>

<!-- <download-excel
			:data="currentList.data"
		>
			<VaSidebarItem>
				<VaSidebarItemContent>
					<VaIcon name="file_download" />
					<VaSidebarItemTitle>Export to xls</VaSidebarItemTitle>
				</VaSidebarItemContent>
			</VaSidebarItem>
		</download-excel> -->

		<div class="sidebar-logout">
			<VaSidebarItem
				v-if="token"
				@click="handleLogout"
			>
				<VaSidebarItemContent>
					<VaIcon name="logout" />
					<VaSidebarItemTitle>Выйти</VaSidebarItemTitle>
				</VaSidebarItemContent>
			</VaSidebarItem>
		</div>
	</VaSidebar>
</template>
  
<script>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { getToken } from '@/utils/storage'
import { useAppSettingsStore, useAuthStore } from '@/stores'

export default {
	name: 'NavigationSidebar',
	props: {
		items: {
			type: Array,
			required: true
		}
	},
	setup() {
		const appSettingsStore = useAppSettingsStore()
		const authStore = useAuthStore()
		const router = useRouter()
		const token = getToken()

		const { showSidebar, isLoading } = storeToRefs(appSettingsStore)

		const handleLogout = async () => {
			await authStore.logout()
			router.push('/login')
		}

		return {
			token,
			authStore,
			showSidebar,
			isLoading,
			handleLogout
		}
	}
}
</script>

<style lang="css">
.sidebar{
	box-shadow: 10px 0 20px 0 var(--va-shadow);
}
.sidebarspinner-wrap{
	display: flex;
	flex-flow: column nowrap;
	justify-content: center;
	align-items: center;

	width:100%;
	height: calc(100% - 110px);
}
.sidebar-link{
	display: block;
	color: var(--fg);
}
.sidebar-logout{
	flex-grow: 1;
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-end;
	align-self: stretch;
	
	padding-bottom: 52px;
}
</style>
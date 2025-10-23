<template>
	<div class="default-item">
		<template v-if="isLoading">
			<div class="loadspinner-wrap">
				<VaProgressCircle
					size="large"
					indeterminate
				/>
			</div>
		</template>
		<template v-else>
			<h1>{{ section.label }}</h1>
			<h2>№{{ id }}</h2>
			<div class="default-item-grid">
				<VaCard
					v-for="(item, i) in itemFormat"
					:key="i"
					stripe
					stripe-color="primary"
				>
					<VaCardTitle>{{ item.title }}</VaCardTitle>
					<VaCardContent>{{ item.value }}</VaCardContent>
				</VaCard>
			</div>
		</template>
	</div>
</template>

<script>
import { watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useItemStore } from '@/stores'

export default {
	name: 'DefaultItem',
	props: {
		section: {
			type: Object,
			required: true
		},
		id: {
			type: [String, Number],
			required: true
		}
	},
	setup(props) {
		const itemStore = useItemStore()

		const { itemFormat } = storeToRefs(itemStore)
		const isLoading = ref(true)

		const loadData = async () => {
			isLoading.value = true
			await itemStore.fetchData(props.section.settings.endpoint, props.id)
			isLoading.value = false
		}

		watch(
			() => [props.section.settings.endpoint, props.id],
			() => {
				loadData()
			},
			{ immediate: true }
		)

		return {
			isLoading,
			itemFormat
		}
	}
}
</script>

<style lang="css">
.default-item{
	position: relative;
	
	padding: 20px 20px 0;
}
.default-item-grid{
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap:10px;

	width:100%;
	max-width: 1000px;

	margin: 20px auto 0;
	padding-bottom: 20px;
}
.default-item h2{
	margin-top: 20px;
}
</style>

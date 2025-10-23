<template>
	<VaCollapse
		v-model="isCollapsed"
		header="Фильтры"
		color="backgroundBorder"
	>
		<div class="list-filters">
			<div
				v-for="(field, i) in filters.fields"
				:key="i"
				class="list-filters-item"
			>
				<template v-if="field.type === 'string'">
					<VaInput
						v-model="field.value"
						:label="field.title"
					/>
				</template>
				<template v-else-if="field.type === 'select'">
					<VaSelect
						v-model="field.value"
						:label="field.title"
						:options="field.values"
						text-by="name"
						value-by="value"
						placeholder="Выберите вариант"
					/>
				</template>
				<template v-else-if="field.type === 'select-multi'">
					<VaSelect
						v-model="field.value"
						:label="field.title"
						:options="field.values"
						:max-visible-options="2"
						text-by="name"
						value-by="value"
						multiple
						placeholder="Выберите вариант"
					/>
				</template>
				<template v-else-if="field.type === 'date_range'">
					<VaDateInput
						v-model="field.dateRangeModel"
						:label="field.title"
						:start-year="dateRangeLimits.minDate.getFullYear()"
  						:end-year="dateRangeLimits.maxDate.getFullYear()"
  						:allowed-years="allowedYears"
						mode="range"
					/>
				</template>
			</div>
			<VaButton
				@click="$emit('updateFilters')"
				class="mt-2"
				block
			>Применить</VaButton>
		</div>
	</VaCollapse>
</template>

<script>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useListStore } from '@/stores'
import { dateRangeLimits } from '@/stores/'

export default {
	name: 'ListFilters',
	setup() {
		const listStore = useListStore()

		const { filters } = storeToRefs(listStore)
		const isCollapsed = ref(false)

		const allowedYears = (date) => {
			const year = date.getFullYear()
			return year >= dateRangeLimits.minDate.getFullYear() && year <= dateRangeLimits.maxDate.getFullYear()
		}

		return {
			listStore,
			isCollapsed,
			filters,
			allowedYears,
  			dateRangeLimits
		}
	}
}
</script>

<style lang="css">
.list-filters {
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	align-items: flex-start;
	gap: 20px;
}
.list-filters-item {
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-start;
	align-items: flex-start;
	gap: 10px;
}
.list-filters-item__checkbox {
	margin-top: 18px;
}
.va-collapse {
	position: relative;
	z-index: 10;
}
.va-collapse.va-collapse--expanded {
	box-shadow: 0 0 20px 0 var(--va-shadow);
}
.va-collapse__content{
	padding: 10px 12px 12px;
}
.va-collapse__header {
	padding: 9px 10px;
	color: var(--va-primary) !important;
}
.va-collapse__body-wrapper--bordered {
	position: absolute;
	top: 36px;
	width: calc(100% - 2px);
	border-right: 1px solid var(--va-background-border);
	border-left: 1px solid var(--va-background-border);
	background-color: var(--va-background-primary);
	box-shadow: 0 0 20px 0 var(--va-shadow);
	z-index: -10;
}
.va-collapse__header__text {
	color: var(--va-primary);
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 0.625rem;
	letter-spacing: 0.6px;
	line-height: 1.2;
	font-weight: 700;
	text-transform: uppercase;
}
</style>

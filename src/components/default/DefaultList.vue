<template>
	<h1>{{ section.label }}</h1>
	<div class="default-list">
		<template v-if="isLoadingTable">
			<div class="loadspinner-wrap">
				<VaProgressCircle
					size="large"
					indeterminate
				/>
			</div>
		</template>
		<template v-else>
			<div class="default-list-header">
				<div
					v-if="search.enabled"
					class="default-list-search"
				>
					<VaInput
						v-model="search.value"
						@keyup.enter="loadData"
						placeholder="Найти..."
						label="поиск"
						inner-label
					>
						<template #appendInner>
							<VaButton
								@click="loadData"
								preset="secondary"
								hover-behavior="opacity"
								:hover-opacity="0.4"
							>
								<VaIcon
									name="search"
									color="primary"
								/>
							</VaButton>
						</template>
					</VaInput>
				</div>

				<div class="default-list-filters">
					<ListFilters
						v-if="filters.enabled"
						@update-filters="loadData"
					></ListFilters>
				</div>

				<router-link
					:to="{ name: `${section.name}-add` }"
					class="default-list-add"
				>
					<VaButton size="medium">+ Добавить запись</VaButton>
				</router-link>
			</div>
			<VaDataTable
				:columns="processedColumns"
				:items="transformedList?.data || []"
				:striped="true"
				:disableClientSideSorting="true"
				:sortingOptions="['asc', 'desc']"
				:loading="isLoadingData"
				v-model:sort-by="sorting.field"
				v-model:sorting-order="sorting.order"
				@columnSorted="sortingList"
			>
				<template
					v-for="field in transformedList?.fields"
					:key="field.key"
					#[`cell(${field.key})`]="{ value, rowData }"
				>
					<template v-if="field.type === 'boolean'">
						<VaIcon
							:name="['true', true, 1, '1'].includes(value) ? 'done' : 'close'"
							:color="['true', true, 1, '1'].includes(value) ? 'success' : 'danger'"
							class="default-list__boolean"
						/>
					</template>

					<template v-else-if="field.key === 'date'">
						<span class="nowrap">{{ formatLocalDate(value) }}</span>
					</template>

					<template v-else-if="field.key === 'birth_date'">
						<span class="nowrap">{{ formatLocalDate(value) }}</span>
					</template>					

					<template v-else-if="field.key === 'mobile_phone'">
						<span class="nowrap">{{ formatPhone(value) }}</span>
					</template>

					<template v-else-if="field.type === 'array'">
						<div v-for="(item, i) in value.replace(/^\[|\]$/g, '').split(',')" :key="i">
							{{ item }}
						</div>
					</template>

					<template v-else-if="field.type === 'image' && value">
						<VaAvatar
							:src="value"
							fallback-icon="warning"
							size="100px"
							square
						/>
					</template>

					<template v-else-if="field.type === 'edit'">
						<router-link :to="{ name: `${section.name}-edit`, params: { id: value } }">
							<VaIcon name="edit" />
						</router-link>
					</template>

					<template v-else-if="field.name === 'id'">
						<router-link :to="`${section.name}/${value}`">{{ value }}</router-link>
					</template>

					<template v-else-if="field.type === 'select'">
						<VaCheckbox
							:modelValue="selectedItems.includes(rowData.id)"
  							@update:modelValue="val => toggleRow(rowData.id, val)"
						/>
					</template>

					<template v-else>
						{{ value }}
					</template>
				</template>
			</VaDataTable>

			<div class="default-list-footer">
				<div class="default-list-selected">
					<div class="default-list-selected__check">
						<VaCheckbox
							v-model="allSelected"
							@update:modelValue="onSelectAllChange"
							label="Выбрать все"
						/>
					</div>
					<VaSelect
						v-model="selectedAction"
						:options="selectedActions.actions"
						:disabled="!selectedActions.enabled"
						placeholder="Действие с отмеченными"
						class="default-list-selected__select"
					></VaSelect>
				</div>
				<div class="default-list-paginator">
					<VaPagination
						v-if="pagination.totalPages > 1"
						v-model="pagination.currentPage"
						:pages="pagination.totalPages"
						:visible-pages="5"
						@update:modelValue="loadData"
					/>
				</div>
				<div class="default-list-perpage">
					<VaSelect
						v-model="pagination.pagesize"
						label="Записей на странице"
						:options="[5, 10, 15, 25, 50]"
						@update:modelValue="loadData"
					/>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import { watch, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useListStore } from '@/stores'
import { formatLocalTime, formatLocalDate, formatPhone } from '@/utils/helpers'
import ListFilters from '@/components/default/list/ListFilters.vue'


export default {
	name: 'DefaultList',
	components: {
		ListFilters
	},
	props: {
		section: {
			type: Object,
			required: true
		}
	},
	setup(props) {
		const listStore = useListStore()

		const { originalData, pagination, sorting, filters, search, allSelected, selectedItems, selectedActions } = storeToRefs(listStore)
		const isLoadingTable = ref(false)
		const isLoadingData = ref(false)
		const selectedAction = ref('')

		const transformedList = computed(() => {
			if (!originalData.value) return null

			const fields = originalData.value.fields.map(({ sort, ...field }) => ({
				...field,
				key: field.name,
				label: field.title
			}))

			fields.splice(1, 0, {
				key: 'edit',
				label: 'Изменить',
				sortable: false,
				type: 'edit',
				width: '80px',
				thAlign: 'top',
				tdAlign: 'center'
			})

			fields.splice(0, 0, {
				key: 'checkbox',
				label: 'Выбрать',
				sortable: false,
				type: 'select',
				width: '60px',
				thAlign: 'top',
				tdAlign: 'center'
			})

			return {
				...originalData.value,
				fields,
				data: originalData.value.data.map((item) => ({
					...item,
					edit: item.id
				}))
			}
		})

		const processedColumns = computed(() => {
			return (
				transformedList.value?.fields?.map((field) => ({
					...field,
					key: field.key,
					label: field.label,
					sortable: field.sortable
				})) || []
			)
		})

		const loadData = async () => {
			isLoadingData.value = true

			await listStore.fetchData(props.section.settings.endpoint)

			isLoadingData.value = false
		}

		const loadTable = async () => {
			isLoadingTable.value = true

			await listStore.fetchData(props.section.settings.endpoint)

			isLoadingTable.value = false
		}

		const changeEndpoint = () => {
			listStore.resetState()
			loadTable()
		}

		const sortingList = () => {
			console.log(sorting.value.enabled)
			if (sorting.value.enabled) loadData()
		}

		const toggleRow = (id, isChecked) => {
			if (isChecked) {
				if (!selectedItems.value.includes(id)) {
				selectedItems.value.push(id)
				}
			} else {
				selectedItems.value = selectedItems.value.filter(existingId => existingId !== id)
				allSelected.value = false
			}
		}

		const onSelectAllChange = (isSelected) => {
			allSelected.value = isSelected

			const currentData = transformedList.value?.data || []

			if (isSelected) {
				selectedItems.value = currentData.map(item => item.id)
			} else {
				selectedItems.value = []
			}
		}

		watch(() => props.section.settings.endpoint, changeEndpoint, { immediate: true })
		watch(
			transformedList,
			(newList) => {
				if (allSelected.value && newList?.data) {
				selectedItems.value = newList.data.map(item => item.id)
				}
			},
			{ immediate: true }
		)


		return {
			isLoadingTable,
			isLoadingData,
			loadData,
			pagination,
			sorting,
			filters,
			search,
			sortingList,
			transformedList,
			processedColumns,
			formatLocalTime,
			formatLocalDate,
			formatPhone,
			allSelected,
			selectedItems,
			onSelectAllChange,
			toggleRow,
			selectedActions,
			selectedAction
		}
	}
}
</script>

<style lang="css">
.default-list {
	position: relative;

	padding: 20px;
}

.default-list-header {
	display: grid;
	grid-template-columns: 1fr 274px 280px;
	grid-template-areas: 'search filters add';
	grid-gap: 10px;
	margin-bottom: 20px;
}

.default-list-search {
	grid-area: search;
}

.default-list-search .va-input-wrapper__field {
	padding-right: 0;
}

.default-list-filters {
	grid-area: filters;
}

.default-list-add {
	grid-area: add;
	padding-left: 40px;
}

.default-list-add>.va-button {
	width: 100%;
	height: auto;
}

.default-list__img {
	display: block;
	width: 100px;
	height: 100px;
	object-fit: contain;
	object-position: top center;
}

.default-list__boolean {
	display: block;
	width: 18px;
	margin: 0 auto;
}

.default-list-footer {
	display: grid;
	grid-template-columns: 250px 1fr 150px;
	grid-gap: 20px;

	margin-top: 20px;
}

.default-list-selected{
	display: flex;
	flex-flow: row wrap;
	justify-content: flex-start;
	align-items: center;
	gap: 5px;

	margin-top: -9px;
}
.default-list-selected__check{
	padding-left: 20px;
}
.default-list-selected__check label{
	display: inline-block;

	min-height: 1rem;

	font-size: 0.625rem;
	font-weight: 700;
	letter-spacing: 0.6px;
	text-transform: uppercase;

	color: var(--va-primary);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.default-list-paginator {
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;

	padding: 18px 100px 0 0;
}

.default-list-perpage {
	align-self: flex-start;
}

.default-list a {
	color: var(--va-primary);
}
</style>
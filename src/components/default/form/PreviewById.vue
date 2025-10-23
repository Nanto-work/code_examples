<template>
		<div class="preview-by-id">
			<div class="preview-by-id__header">
				<VaInput
					v-model="field.value"
					block="false"
					:label="`${field.title} ID`"
					:readonly="field.readonly"
					:color="field.readonly ? 'secondary' : 'primary'"
					:requiredMark="field.required"
					type="number"
					min="0"
				/>
				<VaButton
					@click="handleLoad()"
				>Загрузить данные</VaButton>
			</div>
			
			<SuggestInput
				v-model="selected"
				:fetch-suggestions="fetchSuggestions"
				placeholder="Введите фамилию или номер карты..."
				@select="onSelect"
			>
				<template #item="{ item }">
					<VaListItemSection avatar>
						<VaAvatar
							:src="avatarSrc(item)"
							fallback-icon="warning"
							square
						/>
					</VaListItemSection>

					<VaListItemSection>
						<div
							v-for="({ key, val }) in fieldsToShow(item)"
							:key="key"
							:class="['field', `field--${key}`]"
						>{{ val }}</div>
					</VaListItemSection>
				</template>
			</SuggestInput>
			
			<div class="preview-by-id__result">
				<template v-if="isLoading">
					<div class="loadspinner-wrap">
						<VaProgressCircle indeterminate />
					</div>
				</template>
				
				<div
					v-else-if="dataResult?.fields"
					class="preview-by-id__cards"
				>
					<VaCard
						v-for="(i, index) in filteredFields"
						:key="index"
						class="data-item"
					>
							<VaCardTitle>{{ i.title }}</VaCardTitle>
							
							<VaCardContent
								v-if="i.name === 'birth_date'"
							>{{ formatLocalDate(dataResult.data[i.name]) }}</VaCardContent>

							<VaCardContent
								v-else-if="i.name === 'mobile_phone' || i.name === 'mobile-phone'"
							>{{ formatPhone(dataResult.data[i.name]) }}</VaCardContent>

							<VaCardContent
								v-else-if="i.type === 'image' && dataResult.data[i.name]"
							>
								<VaAvatar
									:src="dataResult.data[i.name]"
									fallback-icon="warning"
									size="100px"
									square
								/>
							</VaCardContent>

							<VaCardContent
								v-else-if="i.name === '_cards'"
							>
								<div
									v-for="(item, index) in dataResult.data[i.name]"
									:key="index"
								>{{ item }}</div>
							</VaCardContent>
							
							<VaCardContent
								v-else
							>{{ dataResult.data[i.name] }}</VaCardContent>
					</VaCard>
				</div>
				<div v-else class="preview-by-id__no-data va-title">Данные не загружены</div>
			</div>
		</div>
</template>

<script>
import { ref, computed } from 'vue'
import { useFormStore, useListStore } from '@/stores'
import { formatLocalTime, formatLocalDate, formatPhone } from '@/utils/helpers'
import SuggestInput from '@/components/ui/SuggestInput.vue'

export default {
	name: 'PreviewById',
	components: {
		SuggestInput
	},
	props: {
		field: {
			type: Object,
			required: true
		}
	},
	setup(props) {
		const formStore = useFormStore()
		const listStore = useListStore()

		const allowedFieldsByModel = {
			clients: ['id', 'last_name', 'first_name', 'middle_name', '_cards', 'photo_main'],
			xls:     ['id', 'ifo', 'nomer-karty', 'foto'],
			users:   ['id', 'name', 'role']
		}

		const dataResult = ref(null)
		const isLoading = ref(false)
		const selected = ref('')
		const avatarSrc = (o) => o.photo_main || o.foto || ''

		const filteredFields = computed(() => {
		if (!dataResult.value || !dataResult.value.fields) return []

			return dataResult.value.fields.filter(i => {
				const val = dataResult.value.data?.[i.name]
				if (val == null) return false
				if (typeof val === 'string' && val.trim() === '') return false
				if (Array.isArray(val) && val.length === 0) return false

				return true
			})
		})

		const fieldsToShow = (o) => {
			return Object.entries(o || {})
				.filter(([k]) => !['id', 'photo_main', 'foto'].includes(k))
				.map(([k, v]) => ({
				key: k,
				val: Array.isArray(v)
					? (v.length ? v.join(', ') : '')
					: (v ?? '')
			}))
		}

		const onSelect = (id) => {
			props.field.value = id
		}

		const handleLoad = async() => {
			isLoading.value = true
			dataResult.value = await formStore.fetchMergingData(props.field.control.model, props.field.value)
			isLoading.value = false
		}

		const fetchSuggestions = async (query) => {
			const res  = await listStore.findData(props.field.control.model, query)
			const need = allowedFieldsByModel[props.field.control.model]

			if (!need) return res.data

			return (res.data || [])
				.filter(Boolean)
				.map(obj => Object.fromEntries(need.map(k => [k, obj?.[k] ?? null])))
		}


		return{
			dataResult,
			handleLoad,
			isLoading,
			fetchSuggestions,
			filteredFields,
			selected,
			onSelect,
			avatarSrc,
			fieldsToShow,
			formatLocalDate,
			formatLocalTime,
			formatPhone
		}
	}
}
</script>

<style lang="css" scoped>
.preview-by-id {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.preview-by-id__header {
	display: flex;
	align-items: flex-end;
	gap: 20px;
}

.preview-by-id__header .va-input {
	width: 150px;
	flex: 1 0 auto;
}

.preview-by-id__header .va-button {
	flex: 0 0 auto;
}

.preview-by-id__result {
	position: relative;
}

.preview-by-id__no-data {
	padding-top: 20px;
	text-align: center;
	color: var(--va-primary);
}

.preview-by-id__cards {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.suggest-list .va-list-item-section--main{
	display: block;
}
.suggest-list .va-list-item-section > .field--last_name,
.suggest-list .va-list-item-section > .field--first_name,
.suggest-list .va-list-item-section > .field--middle_name{
	display: inline-block;
	margin-right: 0.3em;
	font-size: 14px;
	font-weight: 700;
}
.suggest-list .va-list-item-section > .field--ifo,
.suggest-list .va-list-item-section > .field--name{
	font-size: 14px;
	font-weight: 700;
}

.suggest-list .va-list-item-section > .field--_cards,
.suggest-list .va-list-item-section > .field--nomer-karty,
.suggest-list .va-list-item-section > .field--role{
	margin-top: 5px;
	font-size: 14px;
}

.preview-by-id__result .loadspinner-wrap{
	top: 10px;
	padding: 20px 0;
}

</style>
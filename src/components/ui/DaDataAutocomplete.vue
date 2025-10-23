<template>
	<div
		class="dadata-autocomplete"
		ref="containerRef"
	>
		<va-input
			v-model="searchQuery"
			@input="debouncedHandleInput"
			@focus="handleFocus"
			:placeholder="placeholder"
			:loading="loading"
			:label="label"
			:readonly="readonly"
			:color="color"
			:requiredMark="requiredMark"
			:rules="rules"
		>
			<template #appendInner>
				<va-icon
					v-if="searchQuery"
					@click="clearInput"
					name="close"
					color="secondary"
				/>
			</template>
		</va-input>
		<va-dropdown
			v-model="showSuggestions"
			:closeOnContentClick="false"
			placement="bottom"
			:disabled="!suggestions.length"
			:target="containerRef"
			class="dropdown-full-width"
		>
			<template #anchor>
				<div></div>
			</template>

			<VaDropdownContent class="suggestions-container">
				<div
					v-for="(suggestion, index) in suggestions"
					:key="index"
					class="suggestion-item"
					@click="selectSuggestion(suggestion)"
				>
					{{ suggestion.value }}
				</div>
			</VaDropdownContent>
		</va-dropdown>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import dadata from '@/utils/dadata'

const props = defineProps({
	modelValue: {
		type: [String, Object],
		default: ''
	},

	label: {
		type: String,
		default: 'Поиск адреса'
	},
	placeholder: {
		type: String,
		default: 'Введите адрес'
	},
	type: {
		type: String,
		default: 'address'
	},
	debounceTime: {
		type: Number,
		default: 300
	},
	readonly: {
		type: Boolean,
		default: false
	},
	color: {
		type: String,
		default: 'primary'
	},
	requiredMark: {
		type: Boolean,
		default: false
	},
	rules: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['update:modelValue'])
const containerRef = ref(null)
const searchQuery = ref(props.modelValue)
const suggestions = ref([])
const loading = ref(false)
const showSuggestions = ref(false)

// Синхронизация с v-model
watch(
	() => props.modelValue,
	(newValue) => {
		if (typeof newValue === 'string') {
			searchQuery.value = newValue
		} else if (newValue && newValue.value) {
			searchQuery.value = newValue.value
		}
	}
)

const debounce = (fn, delay) => {
	let timeoutId
	return (...args) => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => fn(...args), delay)
	}
}

const handleInput = async (value) => {
	if (!value.target.value) {
		suggestions.value = []
		showSuggestions.value = false
		return
	}

	loading.value = true
	try {
		const response = await dadata.post(
			'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/' + props.type,
			{
				query: value.target.value
			}
		)
		suggestions.value = response.data.suggestions
		showSuggestions.value = true
	} catch (error) {
		console.error('DaData API error:', error)
	} finally {
		loading.value = false
	}
}

const debouncedHandleInput = debounce(handleInput, props.debounceTime)

const selectSuggestion = (suggestion) => {
	searchQuery.value = suggestion.value
	showSuggestions.value = false
	emit('update:modelValue', suggestion)
}

const clearInput = () => {
	searchQuery.value = ''
	suggestions.value = []
	showSuggestions.value = false
}

const handleFocus = () => {
	if (suggestions.value.length) {
		showSuggestions.value = true
	}
}
</script>

<style scoped>
.dadata-autocomplete{
	position: relative;
	width: 100%;
}

:deep(.dropdown-full-width) {
	width: 100%;
}

:deep(.va-dropdown__content) {
	position: absolute;
	top: 100% !important;
	left: 0;
	right: 0;
	bottom: unset !important;
	width: 100%;

	transform: unset !important;
}

.suggestions-container {
	height: auto;
	max-height: 300px;
	
	background-color: var(--va-background-primary) !important;
	border: 1px solid var(--va-background-border);
	box-shadow: 0 0 20px 0 var(--va-shadow);
	
	overflow-y: auto;
}

.dadata-autocomplete .va-dropdown__content {
	padding: 0;
}

.suggestion-item {
	padding: 8px;
	cursor: pointer;
	transition: background-color 0.2s;
}

.suggestion-item:hover {
	background-color: var(--select_hover);
}
</style>

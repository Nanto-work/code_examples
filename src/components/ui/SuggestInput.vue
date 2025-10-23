<template>
	<div class="suggest" ref="containerRef">
		<va-input
			v-model="modelValue"
			:placeholder="placeholder"
			@update:modelValue="onInput"
			:loading="loading"
			:readonly="readonly"
			:label="label"
			:color="color"
			:required-mark="requiredMark"
			:error="error"
			:error-messages="errorMessages"
		>
			<template #appendInner>
				<va-icon
					v-if="modelValue"
					name="close"
					color="secondary"
					style="cursor:pointer"
					@click="clearInput"
				/>
			</template>
		</va-input>
  
		<va-list
			v-if="suggestions.length && showSuggestions"
			class="suggest-list"
		>
			<va-list-item
				v-for="(item, index) in suggestions"
				:key="index"
				@click="selectSuggestion(item)"
				class="suggest-list-item"
			>
				<slot
					name="item"
					:item="item"
					:getLabel="getLabel"
				>
					{{ getLabel(item) }}
				</slot>
			</va-list-item>
		</va-list>
	</div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

export default {
	name: 'SuggestInput',
	props: {
		modelValue: [String, Number, Object],
		placeholder: String,
		fetchSuggestions: { type: Function, required: true },
		loading: Boolean,
		readonly: Boolean,
		label: String,
		color: String,
		requiredMark: Boolean,
		error: Boolean,
		errorMessages: [String, Array],
		labelFields: {
			type: Array,
			default: () => [],
		}
	},
	emits: ['update:modelValue', 'select'],
	setup(props, { emit }) {
		const modelValue = ref(props.modelValue ?? '')
		const suggestions = ref([])
		const showSuggestions = ref(false)
		const containerRef = ref(null)

		const getLabel = (item) => {
			if (typeof item !== 'object') return item
			if (props.labelFields.length) {
				return props.labelFields
				.map((f) => item?.[f])
				.filter(Boolean)
				.join(' ')
			}
			// fallback: первое поле
			return Object.values(item)[0] ?? ''
		}
		const onInput = async(val) => {
			emit('update:modelValue', val)
			if (!val) {
				suggestions.value = []
				showSuggestions.value = false
				return
			}
			try {
				const result = await props.fetchSuggestions(val)
				suggestions.value = result || []
				showSuggestions.value = suggestions.value.length > 0
			} catch {
				suggestions.value = []
				showSuggestions.value = false
			}
		}

		const selectSuggestion = (item) => {
			/* emit('update:modelValue', getLabel(item)) */
			emit('update:modelValue', '')
			emit('select', item?.id)
			showSuggestions.value = false
		}

		const clearInput = () => {
			modelValue.value = ''
			suggestions.value = []
			showSuggestions.value = false
			emit('update:modelValue', '')
		}

		watch(() => props.modelValue, (v) => (modelValue.value = v))

		const onClickOutside = (e) => {
			if (containerRef.value && !containerRef.value.contains(e.target))
				showSuggestions.value = false
		}

		onMounted(() => window.addEventListener('click', onClickOutside))
		onBeforeUnmount(() => window.removeEventListener('click', onClickOutside))

		return {
			modelValue,
			suggestions,
			showSuggestions,
			containerRef,
			getLabel,
			onInput,
			selectSuggestion,
			clearInput,
		}
	},
}
</script>

<style>
.suggest {
	position: relative;
	width: 100%;
}

.suggest-list {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	max-height: 300px;
	overflow-y: auto;
	background-color: var(--va-background-primary);
	border: 1px solid var(--va-background-border);
	box-shadow: 0 0 20px 0 var(--va-shadow);
	z-index: 1000;
	padding: 0;
	margin: 0;
}

.suggest-list-item{
	padding: 5px;
	border-bottom: 1px solid var(--va-background-border);
	cursor: pointer;
	transition: background-color .2s;
}
.suggest-list-item:last-child{
	border-bottom: none;
}

.suggest-list-item:hover {
	background-color: var(--select_hover);
}

.suggest-list-item .va-list-item__inner{
	align-items: flex-start;
}
</style>
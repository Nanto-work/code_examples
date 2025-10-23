<template>
	<div v-if="field.type !== 'hidden'">
		<component
			:is="componentType"
			v-model="modelValueSafe"
			v-bind="componentProps"
			@update:model-value="onUpdate"
		>
			<template
				v-if="needsLabel"
				#label
			>
				<label
					:style="field.readonly ? 'color: var(--va-secondary);' : 'color: var(--va-primary);'"
					class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer"
				>
					{{ field.title }}
					<span
						v-if="field.required"
						class="va-input-label__required-mark"
					> * </span>
				</label>
			</template>
		</component>

		<div
			v-if="showAdvice"
			@click="applyAdvice"
			class="field-advice"
		>Вставить: <span class="field-advice__text">{{ formattedAdvice }}</span>
		</div>

		<div
			v-if="field.type === 'image' && hasImageError"
			class="va-message-list__message"
			style="color: var(--va-danger)"
		>
			Необходимо загрузить изображение</div>
	</div>
</template>

<script>
import { computed } from 'vue'
import { VaInput, VaTextarea, VaCheckbox, VaSelect, VaDateInput, VaFileUpload } from 'vuestic-ui'
import { formatLocalDate } from '@/utils/helpers'
import DaDataAutocomplete from '@/components/ui/DaDataAutocomplete.vue'
import HiddenInput from '@/components/ui/HiddenInput.vue'

export default {
	name: 'DynamicField',
	components: {
		VaInput,
		VaTextarea,
		VaCheckbox,
		VaSelect,
		VaDateInput,
		VaFileUpload,
		DaDataAutocomplete,
		HiddenInput
	},
	props: {
		field: {
			type: Object,
			required: true
		},
		hasImageError: {
			type: Boolean,
			default: false
		},
		onDadataFill: Function
	},
	emits: ['update:modelValue'],
	setup(props, { emit }) {
		const componentType = computed(() => {
			switch (props.field.type) {
				case 'string': return VaInput
				case 'image': return VaFileUpload
				case 'date': return VaDateInput
				case 'select':
				case 'select-multi': return VaSelect
				case 'password': return VaInput
				case 'text':
				case 'json': return VaTextarea
				case 'boolean': return VaCheckbox
				case 'address': return DaDataAutocomplete
				case 'hidden': return HiddenInput
				default:
					console.warn(`[DynamicField] Unknown field type: ${props.field.type}`, props.field)
					return null
			}
		})

		const componentProps = computed(() => {
			const f = props.field
			const base = {
				label: f.title,
				readonly: f.readonly,
				color: f.readonly ? 'secondary' : 'primary',
				requiredMark: f.required,
				rules: []
			}

			if (f.required) {
				switch (f.type) {
					case 'string':
					case 'password':
					case 'text':
					case 'json':
					case 'address':
						base.rules = [(v) => (v && v.trim().length > 0) || 'Это поле обязательно']
						break
					case 'date':
						base.rules = [(v) => !!v || 'Это поле обязательно']
						break
					case 'select':
						base.rules = [(v) => v !== null || 'Выберите вариант']
						break
					case 'select-multi':
						base.rules = [(v) => (Array.isArray(v) && v.length >= 1) || 'Выберите минимум один вариант']
						break
				}
			}

			if (f.type === 'select' || f.type === 'select-multi') {
				base.options = f.values
				base.textBy = 'name'
				base.valueBy = 'value'
				if (f.type === 'select-multi') {
					base.multiple = true
					base.maxVisibleOptions = 2
					base.placeholder = 'Выберите вариант'
				}
			}

			if (f.type === 'image') {
				base.type = 'gallery'
				base['file-types'] = 'image/*'
				base.disabled = f.readonly
			}

			if (f.type === 'password') {
				base.type = 'password'
			}

			if (f.type === 'text' || f.type === 'json') {
				base.minRows = 3
				base.style = 'width: 100%;'
				base.autosize = true
			}

			if (f.type === 'address') {
				base.placeholder = f.placeholder
				base.type = 'address'
			}

			if (f.type === 'hidden') {
				base.name = f.name || f.key || 'hidden-field'
			}

			return base
		})

		const modelValueSafe = computed({
			get() {
				if (props.field.type === 'image') {
					const val = props.field.value
					if (val == null) return []
					if (Array.isArray(val)) return val.filter(f => f != null)
					return [val]
				}
				return props.field.value
			},
			set(value) {
				onUpdate(value)
			}
		})

		const needsLabel = computed(() => ['image'].includes(props.field.type))

		const showAdvice = computed(() => {
			return (props.field.type !== 'image' && typeof props.field.value_advice === 'string' && props.field.value_advice.length > 0)
		})

		const formattedAdvice = computed(() => {
			if (props.field.type === 'date' && typeof props.field.value_advice === 'string') {
				return formatLocalDate(props.field.value_advice)
			}
			return props.field.value_advice || ''
		})

		function applyAdvice() {
			const advice = props.field.value_advice
			if (typeof advice === 'string') {
				onUpdate(advice)
			}
		}

		function onUpdate(value) {
			emit('update:modelValue', value)
			if (props.field.type === 'address' && props.onDadataFill) {
				props.onDadataFill(props.field, value)
			}
		}

		return {
			componentType,
			componentProps,
			needsLabel,
			onUpdate,
			showAdvice,
			formattedAdvice,
			applyAdvice,
			modelValueSafe
		}
	}
}
</script>

<style>
.field-advice {
	margin-top: 4px;
	font-size: 0.875rem;
	color: var(--va-secondary);
	cursor: pointer;

	width: fit-content;
}

.field-advice__text {
	font-style: italic;
	font-weight: 700;

	text-decoration: underline dashed;
}

.field-advice__text:hover {
	color: var(--va-primary);
	text-decoration-style: solid;
}
</style>
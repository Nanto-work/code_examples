<template>
	<VaForm
		ref="formRef"
		class="default-form"
	>
		<VaTabs v-model="activeTabIndex">
			<template #tabs>
				<VaTab
					v-for="(tab, i) in form.tabs"
					:key="i"
				>{{ tab.title || tab.name }}</VaTab>
			</template>
		</VaTabs>

		<div class="tab-content">
			<div class="grid-area-field">
				<DynamicField
					v-for="(field, i) in activeTab.fields"
					:key="i"
					v-model="field.value"
					:field="field"
				/>
			</div>
		</div>

		<FormButtons
			:buttons="form.buttons"
			@submit="handleSubmit"
			@reset="handleReset"
		/>
	</VaForm>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vuestic-ui'
import { useFormStore } from '@/stores'

import DynamicField from '@/components/ui/DynamicField.vue'
import FormButtons from '@/components/default/form/FormButtons.vue'

export default {
	name: 'OneStepForm',
	components: { DynamicField, FormButtons },
	props: {
		form: { type: Object, required: true },
		mode: String,
		id: String,
		section: Object
	},
	setup(props) {
		const formStore = useFormStore()
		const router = useRouter()
		const { validate, reset } = useForm('formRef')

		const activeTabIndex = ref(0)
		const activeTab = computed(() => props.form?.tabs?.[activeTabIndex.value] || { fields: [] })

		const handleSubmit = async () => {
			if (!validate()) return

			const formData = new FormData()

			props.form.tabs.forEach(tab => {
				tab.fields?.forEach(field => {
					const value = field.value
					if (value === null || value === undefined) return

					if (field.type === 'image') {
						if (Array.isArray(value)) {
							value.forEach(file => {
								if (file instanceof File) {
									formData.append(field.name, file)
								}
							})
						}
					} else {
						formData.append(field.name, value)
					}
				})
			})

			if (props.mode === 'add') {
				await formStore.submitAddForm(formData, props.section.settings.endpoint)
			} else if (props.mode === 'edit') {
				await formStore.submitEditForm(formData, props.section.settings.endpoint, props.id)
			}

			router.push(props.section.settings.endpoint)
		}

		const handleReset = () => {
			formStore.resetForm()
			reset()
		}

		return {
			activeTabIndex,
			activeTab,
			handleSubmit,
			handleReset
		}
	}
}
</script>

<style>
.default-form {
	width: 100%;
	max-width: 800px;
	margin: 0 auto;
}

.va-tabs {
	margin-top: 40px;
}

.tab-content {
	margin: 20px auto 40px;
}

.grid-area-field {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px 40px;
}
</style>
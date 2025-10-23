<template>
	<VaForm
		ref="formRef"
		class="multi-form"
	>
		<VaTabs v-model="activeTabIndex">
			<template #tabs>
				<VaTab
					v-for="(tab, index) in transformedForm.tabs"
					:key="index"
				>{{ tab.title || tab.name }}</VaTab>
			</template>
		</VaTabs>

		<div
			:class="['tab-content', hasPreviewById === 'single' ? 'has-preview-single' : hasPreviewById === 'multiple' ? 'has-preview-multiple' : '']">
			<div
				v-if="previewFields"
				class="grid-area-preview"
			>
				<template
					v-for="(field, i) in previewFields"
					:key="i"
				>
					<PreviewById :field="field" />
				</template>
			</div>

			<div class="grid-area-field">
				<template
					v-for="(field, i) in otherFields"
					:key="i"
				>
					<DynamicField
						v-model="field.value"
						:field="field"
					/>
				</template>
			</div>

			<div
				v-if="choosePhotoField"
				class="grid-area-choose-photo"
			>
				<ChoosePhoto
					:field="choosePhotoField"
					:error="hasChoosePhotoError"
				/>
			</div>
		</div>

		<div
			v-if="transformedForm.buttons && transformedForm.buttons.length > 0"
			class="btn-box"
		>
			<template
				v-for="(btn, index) in transformedForm.buttons"
				:key="index"
			>
				<VaButton
					v-if="btn.name === 'submit'"
					@click="handleSubmit"
				>{{ btn.title }}</VaButton>
				<VaButton
					v-else-if="btn.name === 'reset'"
					color="secondary"
					@click="handleReset"
					style="order: 1;"
				>{{ btn.title }}</VaButton>
			</template>
		</div>
		<div
			v-else
			class="btn-box"
		>
			<VaButton @click="handleSubmit">Синхронизировать</VaButton>
			<VaButton
				color="secondary"
				@click="handleReset"
				style="order: 1;"
			>Сбросить</VaButton>
		</div>
	</VaForm>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { useFormStore } from '@/stores'
import { useRouter } from 'vue-router'
import PreviewById from '@/components/default/form/PreviewById.vue'
import ChoosePhoto from '@/components/ui/ChoosePhoto.vue'
import DynamicField from '@/components/ui/DynamicField.vue'

const props = defineProps({
	form: { type: Object, required: true },
	mode: String,
	id: String,
	section: Object
})

const formStore = useFormStore()
const router = useRouter()
const { validate, reset } = useForm('formRef')

const activeTabIndex = ref(0)
const hasImageError = ref(false)
const hasChoosePhotoError = ref(false)
const transformedForm = ref(props.form)

const activeTab = computed(() => transformedForm.value?.tabs[activeTabIndex.value] || null)

const hasPreviewById = computed(() => {
	const count = activeTab.value?.fields?.filter(f => f.type === 'preview_by_id')?.length || 0
	if (count === 0) return 'none'
	if (count === 1) return 'single'
	return 'multiple'
})

const previewFields = computed(() => activeTab.value?.fields.filter(f => f.type === 'preview_by_id'))
const choosePhotoField = computed(() => activeTab.value?.fields.find(f => f.type === 'choose_photo'))
const otherFields = computed(() => activeTab.value?.fields.filter(f => f.type !== 'preview_by_id' && f.type !== 'choose_photo'))

const handleSubmit = async () => {
	const vuesticValid = validate()
	const formData = new FormData()

	hasImageError.value = false
	hasChoosePhotoError.value = false

	transformedForm.value.tabs.forEach(tab => {
		if(tab.fields) {
			tab.fields.forEach(field => {
				if(field.required) {
					if(field.type === 'image' && !field.value?.length) {
						hasImageError.value = true
					} else if(field.type === 'choose_photo' && !field.value) {
						hasChoosePhotoError.value = true
					}
				}

				if(field.value !== null && field.value !== undefined) {
					if(field.type === 'image' && Array.isArray(field.value)) {
						/* field.value.forEach((file, index) => {
							formData.append(field.name, file)
						}) */
						if (field.value.length > 0) {
							formData.append(field.name, field.value[0])
						}
					} else if(field.type === 'choose_photo' && field.value instanceof File) {
						formData.append(field.name, field.value)
					} else {
						formData.append(field.name, field.value)
					}
				}
			})
		}
	})

	if (vuesticValid && !hasImageError.value && !hasChoosePhotoError.value) {

		const res = await formStore.submitEditForm(formData, props.section.settings.endpoint, props.id)

		if (res.status !== 'ok') return
		if (res.status === 'ok' && (res.data?.status === 'matched_xls' || res.data?.status === 'matched_xls_params')) {
			await formStore.fetchEditData(props.section.settings.endpoint, props.id)
			activeTabIndex.value = 0
			return
		}
		router.push(props.section.settings.endpoint)
	}
}

const handleReset = () => {
	formStore.resetForm()
	reset()
}

const handleClientUserPairDetected = () => {
	console.log('Обнаружено несколько preview_by_id — вызываем нужную функцию')
	// TODO: твоя логика
}

watch(hasPreviewById, (val) => {
	if (val === 'multiple') {
		handleClientUserPairDetected()
	}
}, { immediate: true })
</script>

<style scoped>
.multi-form {
	width: 100%;
	max-width: 800px;
	margin: 0 auto;
}

.va-tabs {
	margin-top: 40px;
}

.grid-area-field {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: auto;
	grid-gap: 20px 40px;
	margin: 20px auto 40px;
}

.tab-content.has-preview-single {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-areas:
		"preview field"
		"choose choose";
	grid-gap: 20px 40px;
	margin: 20px auto 40px;
}

.tab-content.has-preview-single .grid-area-preview {
	grid-area: preview;
	align-self: start;
}

.tab-content.has-preview-single .grid-area-choose-photo {
	grid-area: choose;
}

.tab-content.has-preview-single .grid-area-field {
	grid-area: field;
	align-self: start;
	grid-template-columns: 1fr;
	grid-gap: 20px 0px;
	margin: 0;
	padding-top: 74px;
}

.tab-content.has-preview-multiple .grid-area-preview {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: auto;
	grid-gap: 20px 40px;
	margin: 20px auto 40px;
}

.btn-box {
	display: grid;
	grid-template-columns: 1fr;
	grid-gap: 20px;
	width: 500px;
	margin: 0 auto;
}
</style>
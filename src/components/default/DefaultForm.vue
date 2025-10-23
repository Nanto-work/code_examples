<template>
	<template v-if="!isLoading">
		<h1 v-if="title">{{ title }}</h1>
		<h1 v-else-if="form?.title">{{ form.title }}</h1>
		<h1 v-else>{{ section.label }}</h1>
	</template>

	<div class="default-wrap">
		<template
			v-if="isLoading"
		>
			<div class="loadspinner-wrap">
				<VaProgressCircle size="large" indeterminate />
			</div>
		</template>

		<component
			v-if="!isLoading && form"
			:is="isMultiStep ? 'MultiStepForm' : 'OneStepForm'"
			:form="form"
			:mode="mode"
			:id="id"
			:section="section"
		/>
	</div>
</template>

<script>
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFormStore } from '@/stores'
import OneStepForm from '@/components/default/form/OneStepForm.vue'
import MultiStepForm from '@/components/default/form/MultiStepForm.vue'

export default {
	name: 'DefaultForm',
	components: {
		OneStepForm,
		MultiStepForm
	},
	props: {
		section: {
			type: Object,
			required: true
		},
		mode: {
			type: String,
			validator: value => ['add', 'edit'].includes(value)
		},
		id: String
	},
	setup(props) {
		const formStore = useFormStore()
		const { form, title, isMultiStep, isLoading, recordStatusName } = storeToRefs(formStore)

		const loadData = async () => {
			formStore.isLoading = true

			if (props.mode === 'add') {
				await formStore.fetchAddData(props.section.settings.endpoint)
			} else if (props.mode === 'edit') {
				await formStore.fetchEditData(props.section.settings.endpoint, props.id)
			}

			formStore.isLoading = false
		}

		watch(
			() => [props.section.settings.endpoint, props.mode, props.id],
			() => {
				loadData()
			},
			{ immediate: true }
		)

		return {
			form,
			title,
			isLoading,
			isMultiStep,
			recordStatusName
		}
	}
}
</script>

<style>
.default-wrap {
	padding: 20px;
}
.loadspinner-wrap {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 80px 0;
}
</style>

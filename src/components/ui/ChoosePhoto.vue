<template>
	<div class="choose-photo-el">
		<label
			aria-hidden="true"
			class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer"
			:style="field.readonly ? 'color: var(--va-secondary);' : 'color: var(--va-primary);'"
		>
			{{ field.title }}
			<span
				v-if="field.required"
				class="va-input-label__required-mark"
			> * </span>
		</label>

		<VaRadio
			v-model="field.value"
			:options="field.values"
			:disabled="field.readonly"
			value-by="value"
			text-by="image"
			horizontal
		>
			<template #icon="{ value }">
				<VaIcon
					class="custom-icon"
					:name="value ? 'check_circle' : 'radio_button_unchecked'"
					:color="field.readonly ? 'secondary' : (error ? 'danger' : 'primary')"
					style="order:1; font-size:21px; line-height: 21px;"
				/>
			</template>

			<template #default="{ text }">
				<div class="flex items-center">
					<VaAvatar
						:src="text"
						size="200px"
						class="mb-1"
						fallback-icon="warning"
						square
					/>
				</div>
			</template>
		</VaRadio>

		<div
			v-if="error"
			class="va-message-list__message"
			style="color: var(--va-danger); margin-top: 4px"
		>Выберите один из вариантов	</div>
	</div>
</template>

<script>
export default {
	name: 'ChoosePhoto',
	props: {
		field: {
			type: Object,
			required: true
		},
		error: Boolean
	}
}
</script>

<style lang="css" scoped>
:deep(.va-radio){
	width: 100%;
	justify-content: space-between;
}
:deep(.va-radio__square){
	flex-direction: column;
	justify-content: flex-end;
	align-items: center;
}
:deep(.va-radio__text){
	order: 0;
	display: block;
	margin: 0 auto;
}
.va-avatar{
	display: block;
	line-height: 100px;
}
:deep(.va-avatar img),
:deep(.va-avatar svg){
	display: block;
	object-fit: contain;
	object-position: bottom;
	margin: 0;
	border-radius: 0;
}
</style>
<template>
	<input
		type="hidden"
		:name="name"
		:value="String(modelValue)"
	/>
</template>

<script>
export default {
	name: 'HiddenInput',
	props: {
		modelValue: [String, Number],
		name: String
	}
}
</script>
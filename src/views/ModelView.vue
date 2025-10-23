<template>
	<div class="model-view">
		<router-view></router-view>
	</div>
</template>

<script>
export default {
	name: 'ModelView',
	props: {
		label: {
			type: String,
			required: true
		}
	}
}
</script>

<style lang="css">
.model-view{
	height: 100%;

	padding-top: 20px;
}
</style>
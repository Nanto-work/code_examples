<template>
	<div class="btn-box">
		<template v-if="buttons?.length">
			<VaButton
				v-for="(btn, i) in buttons"
				:key="i"
				:color="btn.name === 'reset' ? 'secondary' : 'primary'"
				:style="btn.name === 'reset' ? 'order: 1;' : ''"
				@click="handleClick(btn.name)"
			>{{ btn.title }}</VaButton>
		</template>

		<template v-else>
			<VaButton
				@click="$emit('submit')"
			>Синхронизировать</VaButton>
			<VaButton
				color="secondary"
				style="order: 1;"
				@click="$emit('reset')"
			>Сбросить</VaButton>
		</template>
	</div>
</template>

<script>
export default {
	name: 'FormButtons',
	props: {
		buttons: Array
	},
	emits: ['submit', 'reset'],
	methods: {
		handleClick(name) {
			if (name === 'submit') this.$emit('submit')
			else if (name === 'reset') this.$emit('reset')
		}
	}
}
</script>

<style>
.btn-box {
	display: grid;
	grid-template-columns: 1fr;
	gap: 20px;
	width: 500px;
	margin: 0 auto;
}
</style>
<template>
	<div class="screen-saver">
		<div class="screen-saver-box">
			<VaForm
				ref="codeForm"
				@submit.prevent="handleUnlock"
				class="unlock-form"
			>
				<h2>Экран заблокирован</h2>
				<VaInput
					v-model="codeInput"
					type="password"
					placeholder="Введите код"
				/>
				<VaButton
					type="submit"
					block
				>Разблокировать</VaButton>
				<div class="unlock-form-auth">
					<router-link to="/login">Авторизоваться</router-link>
				</div>
			</VaForm>
		</div>
	</div>
</template>

<script>
import { ref } from 'vue'
import { useScreenSaverStore, useNotificationsStore } from '@/stores'

export default {
	name: 'ScreenSaver',
	setup() {
		const screenSaverStore = useScreenSaverStore()
		const notificationsStore = useNotificationsStore()

		const codeInput = ref('')

		const handleUnlock = () => {
			if (codeInput.value === screenSaverStore.unlockCode) {
				screenSaverStore.deactivate()
				codeInput.value = ''
			} else {
				notificationsStore.addNotification({
					type: 'error',
					message: 'Неверный код. Попробуйте снова.'
				})
				codeInput.value = ''
			}
		}

		return {
			codeInput,
			handleUnlock
		}
	}
}
</script>

<style lang="css">
.screen-saver {
	display: flex;
	flex-flow: column nowrap;
	justify-content: center;
	align-items: center;

	width: 100%;
	height: 100%;

	background-color: var(--va-background-primary);
	z-index: 9999;
}
.unlock-form {
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	align-items: stretch;
	gap: 20px;

	width: 400px;
	padding: 20px;
	background: var(--white);
	border: 1px solid var(--border-color);
	border-radius: 4px;
	box-shadow: 0 0 4px 0 rgba(36, 31, 45, 0.04);
}
.unlock-form-auth{
	text-align: center;
}
.unlock-form-auth > a{
	text-decoration: underline;
}
.unlock-form-auth > a:hover{
	text-decoration: none;
}
</style>

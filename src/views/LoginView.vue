<template>
	<div class="login-view">
		<div class="login-wrap">
			<VaForm 
				ref="formRef"
				class="login-box"
				@submit.prevent="handleSubmit()"
			>
				<h1>Авторизация</h1>
				<div>
					<VaInput
						v-model="form.email"
						:rules="[(value) => (value && value.length > 0) || 'Введите действующий email']"
						type="email"
						placeholder="you@company.com"
						label="Email"
						required
					>
						<template #appendInner>
							<VaIcon
								name="mail_outline"
								color="secondary"
							/>
						</template>
					</VaInput>
				</div>
				<div>
					<VaInput
						v-model="form.password"
						:rules="[(value) => (value && value.length > 0) || 'Введите пароль']"
						type="password"
						placeholder="Введите пароль"
						label="Пароль"
						required
					>
						<template #appendInner>
							<VaIcon
								name="key"
								color="secondary"
							/>
						</template>
					</VaInput>
				</div>
				<VaButton :disabled="!isValid || isLoading" type="submit">{{ isLoading ? 'Загрузка...' : 'Войти' }}</VaButton>
			</VaForm>
		</div>
	</div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useForm } from 'vuestic-ui'
import { goToHome } from '@/utils/gohome'
import { useAuthStore } from '@/stores'

export default {
	name: 'LoginView',
	setup() {
		const authStore = useAuthStore()
		
		const { isValid, validate } = useForm('formRef')
		const isLoading = ref(false)

		const form = reactive({
			email: '',
			password: ''
		})

		const handleSubmit = async () => {
			const valid = validate()
  
			if (!valid) return

			isLoading.value = true
			await authStore.login(form.email, form.password)
			isLoading.value = false
			await goToHome()
		}
		
		return {
			form,
			isValid,
			validate,
			isLoading,
			handleSubmit
		}
	}
}
</script>

<style lang="css">
.login-view{
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;

	height: 100%;
	width: 100%;
}

.login-wrap__title{
	font-weight: 700;
	font-size: 28px;
	color: var(--va-primary);

	text-align: center;
}

.login-box{
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	align-items: stretch;
	gap: 20px;

	width: 400px;

	margin-top: 20px;
	padding: 20px 20px 30px;

	background: var(--white);
	border: 1px solid var(--border-color);
	border-radius: 4px;
	box-shadow: 0 0 4px 0 rgba(36, 31, 45, 0.04);
}
</style>
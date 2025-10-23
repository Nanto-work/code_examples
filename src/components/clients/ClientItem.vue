<template>
	<div class="clients-item">
		<template v-if="isLoading">
			<div class="loadspinner-wrap">
				<VaProgressCircle
					size="large"
					indeterminate
				/>
			</div>
		</template>
		<template v-else>
			<h1>Клиент №{{ id }}</h1>
			<div class="clients-item-grid">

				<div class="client-row">
					<VaAvatar
						:src="clientData.data.photo_main"
						:fallbackText="id"
						size="200px"
						square
					/>
					<div
						v-if="clientData.data.photos"
						class="client-row-block client-row-block_grow client-row-block_gallery"
					>
						<span class="client-row-block__title">Галерея</span>
					</div>
					<div class="client-block_name">
						<div>{{ clientData.data.last_name }}</div>
						<div>{{ clientData.data.first_name }}</div>
						<div>{{ clientData.data.middle_name }}</div>
					</div>
				</div>

				<div class="client-row">
					<div class="client-row-block client-row-block_cards">
						<span class="client-row-block__title">Карты</span>
						<div
							v-for="item in clientData.data._cards"
						>{{ splitByFour(item) }}</div>
					</div>

					<div class="client-row-block client-row-block_grow client-row-block_contacts">
						<span class="client-row-block__title">Контакты</span>
						<div>
							<span class="client-row-block_desc">Телефон: </span>
							<span class="client-row-block_val">{{ formatPhone(clientData.data.mobile_phone) }}</span>
						</div>
						<div>
							<span class="client-row-block_desc">Адрес: </span>
							<span class="client-row-block_val">{{ clientData.data.address }}</span>
						</div>
					</div>
				</div>

				<div class="client-row">
					<div class="client-row-block client-row-block_table client-row-block_purchases">
						<span class="client-row-block__title">История покупок</span>
						<template v-if="isLoadingPurchases">
							<div class="client-loadspinner-wrap">
								<VaProgressCircle
									size="large"
									indeterminate
								/>
							</div>
						</template>
						<table
							v-else
							class="client-table client-table_purchases"
						>
							<tbody>
								<tr>
									<th>ID</th>
									<th>Карта</th>
									<th>Сумма</th>
									<th>Вес</th>
									<th>Магазин</th>
									<th>Дата</th>
									<th>Запись</th>
								</tr>
								<tr
									v-for="item in clientPurchases.data"
								>
									<td>{{ item.id }}</td>
									<td>{{ item.card_name }}</td>
									<td>{{ item.sum }}</td>
									<td>{{ item.weight }}</td>
									<td>{{ item.store_name }}</td>
									<td>{{ formatLocalDate(item.date) }}</td>
									<td>{{ item.register }}</td>
								</tr>
							</tbody>
						</table>
						<div class="client-table-paginator">
							<VaPagination
								v-if="clientPurchasesPagination.totalPages > 1"
								v-model="clientPurchasesPagination.currentPage"
								:pages="clientPurchasesPagination.totalPages"
								:visible-pages="3"
								@update:modelValue="loadPurchases"
							/>
						</div>
					</div>
				</div>

				<div class="client-row">
					<div class="client-row-block client-row-block_table client-row-block_log">
						<span class="client-row-block__title">Лог операций</span>
						<template v-if="isLoadingEvents">
							<div class="client-loadspinner-wrap">
								<VaProgressCircle
									size="large"
									indeterminate
								/>
							</div>
						</template>
						<table
							v-else
							class="client-table client-table_events"
						>
							<tbody>
								<tr>
									<th>ID</th>
									<th>Дата</th>
									<th>Ответственный</th>
									<th>Тип</th>
									<th>Статус</th>
									<th>Описание</th>
								</tr>
								<tr
									v-for="item in clientEvents.data"
								>
									<td>{{ item.id }}</td>
									<td>{{ formatLocalDate(item.date) }}</td>
									<td>{{ item.user_name }}</td>
									<td>{{ item.type_name }}</td>
									<td>{{ item.status_name }}</td>
									<td class="client-events-desc">{{ item.description }}</td>
								</tr>
							</tbody>
						</table>
						<div class="client-table-paginator">
							<VaPagination
								v-if="clientEventsPagination.totalPages > 1"
								v-model="clientEventsPagination.currentPage"
								:pages="clientEventsPagination.totalPages"
								:visible-pages="3"
								@update:modelValue="loadEvents"
							/>
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import { watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useClientStore } from '@/stores'
import { formatLocalTime, formatLocalDate, formatPhone, splitByFour } from '@/utils/helpers'

export default {
	name: 'ClientItem',
	props: {
		section: {
			type: Object,
			required: true
		},
		id: {
			type: [String, Number],
			required: true
		}
	},
	setup(props) {
		const clientStore = useClientStore()

		const {
			clientData,
			clientPurchases,
			clientPurchasesPagination,
			clientEvents,
			clientEventsPagination
		} = storeToRefs(clientStore)

		const isLoading = ref(true)
		const isLoadingPurchases = ref(false)
		const isLoadingEvents = ref(false)

		const loadData = async () => {
			isLoading.value = true
			await clientStore.fetchData(props.id)
			isLoading.value = false
		}

		const loadPurchases = async () => {
			isLoadingPurchases.value = true

			await clientStore.fetchPurchasesData()

			isLoadingPurchases.value = false
		}

		const loadEvents = async () => {
			isLoadingEvents.value = true

			await clientStore.fetchEventsData()

			isLoadingEvents.value = false
		}


		watch(
			() => [props.section.settings.endpoint, props.id],
			() => {
				loadData()
			},
			{ immediate: true }
		)

		return {
			isLoading,
			isLoadingPurchases,
			isLoadingEvents,
			clientData,
			clientPurchases,
			clientEvents,
			splitByFour,
			formatPhone,
			formatLocalTime,
			formatLocalDate,
			clientPurchasesPagination,
			clientEventsPagination,
			loadPurchases,
			loadEvents
		}
	}
}
</script>

<style lang="css">
.clients-item {
	position: relative;

	padding: 20px 20px 0;
}

.clients-item-grid {
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	align-items: stretch;
	gap: 20px;

	width: 100%;
	max-width: 1000px;

	margin: 20px auto 0;
	padding-bottom: 20px;
}

.client-row{
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-start;
	align-items: stretch;
	gap: 20px;
}
.client-row-block{
	position: relative;
	padding: 10px;
	border: 1px solid var(--va-background-border);
}
.client-row-block_grow{
	flex: 1 0 auto;
}
.client-row-block_table{
	flex: 0 0 100%;
}
.client-row-block__title{
	position: absolute;
	top: -6px;
	left: 10px;

	padding: 0 5px;
	background: var(--va-background-primary);
	
	font-size: 12px;
	font-weight: 700;
	color: var(--va-primary);
	text-transform: uppercase;
}
.client-row-block_desc{
	font-size: 16px;
	
}
.client-row-block_val{
	font-size: 16px;
	font-weight: bold;
}

.client-row-block_cards div{
	margin-top: 5px;
	padding: 2px 4px;
	border: 1px dashed var(--va-background-border);

	font-weight: 700;
}
.client-row-block_cards div:first-of-type{
	margin-top: 0;
}

.client-block_name{
	font-size: 18px;
	font-weight: 700;
}

.photo-row .va-avatar{
	font-size: 36px !important;
}


.client-table{
	width: 100%;
	font-size: 14px;
}
.client-table th{
	padding: 5px 0;
}
.client-table td{
	white-space: wrap;
	text-align: center;
/* 	width: 12%; */
	padding: 5px;
	border: 1px dotted var(--va-background-border);
}
.client-table td:last-child{
	text-align: right;
	font-size: 12px;
}
.client-table_events td:last-child{
	text-align: left;
}
.client-table-paginator{
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;

	padding: 10px 0 0 0;
}
.client-loadspinner-wrap{
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;

	width: 100%;
	height: calc(100% - 46px);

	pointer-events: none;
}
</style>

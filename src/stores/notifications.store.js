// stores/notifications.store.js
import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
	state: () => ({
		notifications: [],
		defaultTimeout: 5000, // Базовая длительность для всех уведомлений
		notificationTypes: { // Конфигурация типов уведомлений
			info: {
				color: 'info',
				icon: 'info',
				defaultTimeout: 5000
			},
			success: {
				color: 'success',
				icon: 'done',
				defaultTimeout: 5000
			},
			warning: {
				color: 'warning',
				icon: 'warning',
				defaultTimeout: 5000
			},
			error: {
				color: 'danger',
				icon: 'error',
				defaultTimeout: 5000
			}
		}
	}),
	actions: {
		addNotification(payload) {
			const typeConfig = this.notificationTypes[payload.type] || this.notificationTypes.info
			
			const notification = {
				id: Date.now(),
				type: payload.type || 'info',
				message: payload.message,
				timeout: payload.timeout || typeConfig.defaultTimeout || this.defaultTimeout,
				...typeConfig
			}

			this.notifications.push(notification)
			
			if (notification.timeout > 0) {
				notification.timeoutId = setTimeout(() => {
					this.removeNotification(notification.id)
				}, notification.timeout)
			}
		},
		removeNotification(id) {
			const index = this.notifications.findIndex(n => n.id === id)
			if (index === -1) return
			
			clearTimeout(this.notifications[index].timeoutId)
			this.notifications.splice(index, 1)
		},
		updateDefaultTimeout(newTimeout) {
			this.defaultTimeout = newTimeout
		}
	}
})
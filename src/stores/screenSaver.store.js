// stores/screenSaver.store.js
import { defineStore } from 'pinia'

export const LOCK_STATE_KEY = 'screen_saver_lock_state'

export const useScreenSaverStore = defineStore('screenSaver', {
	state: () => ({
		isActive: false,
		timeoutId: null,
		idleTimeout: 5 * 60 * 1000, // 5 минут
		unlockCode: '1111'
	}),
	actions: {
		init() {
			const savedState = localStorage.getItem(LOCK_STATE_KEY)
			this.isActive = savedState === 'true'
		},
		startTimer() {
			this.resetTimer()
      		this.timeoutId = setTimeout(() => {
        		this.activate()
      		}, this.idleTimeout)
		},
		resetTimer() {
			if(this.timeoutId) {
				clearTimeout(this.timeoutId)
				this.timeoutId = null
			}
		},
		activate() {
			this.isActive = true
			localStorage.setItem(LOCK_STATE_KEY, 'true')
		},
		deactivate() {
			this.isActive = false
			localStorage.removeItem(LOCK_STATE_KEY)
			this.resetTimer()
		},
		setUnlockCode(newCode) {
			this.unlockCode = newCode
		}
	}
})

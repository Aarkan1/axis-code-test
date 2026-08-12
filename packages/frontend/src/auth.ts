import type { AuthPayload } from './api/graphql'

const sessionStorageKey = 'axis-camera-session'

export type StoredSession = AuthPayload

export const getStoredSession = () => {
    const sessionJson = localStorage.getItem(sessionStorageKey)

    if (!sessionJson) {
        return null
    }

    try {
        return JSON.parse(sessionJson) as StoredSession
    } catch {
        // Clear invalid local data so the app returns to a clean login state.
        localStorage.removeItem(sessionStorageKey)
        return null
    }
}

export const saveSession = (session: StoredSession) => {
    localStorage.setItem(sessionStorageKey, JSON.stringify(session))
}

export const clearSession = () => {
    localStorage.removeItem(sessionStorageKey)
}

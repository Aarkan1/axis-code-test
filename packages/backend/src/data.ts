import { createHash, randomUUID } from 'node:crypto'

export type User = {
    id: string
    name: string
    isAdmin: boolean
}

export type Camera = {
    id: string
    name: string
    niceName?: string
    address: string
}

type UserCamera = {
    userId: string
    cameraId: string
}

type Credential = {
    userId: string
    username: string
    passwordHash: string
}

type Session = {
    token: string
    userId: string
}

const users: User[] = [
    { id: '0', name: 'Alice', isAdmin: false },
    { id: '1', name: 'Bob', isAdmin: false },
    { id: '2', name: 'Admin', isAdmin: true }
]

const credentials: Credential[] = [
    {
        userId: '0',
        username: 'alice',
        passwordHash: '17a96502d336e4c18a43182a353d7f0a38414c6fc4daf678acae834a819cecee' // alice-password
    },
    {
        userId: '1',
        username: 'bob',
        passwordHash: 'df53c27a66157885ba143e34f25d6380e12168b0f7da4f0c46efa54cd9a083b7' // bob-password
    },
    {
        userId: '2',
        username: 'admin',
        passwordHash: '8e70fdbd0400b7a21539fd15fb4ab86c129f7cbd99261dbb0d95c18df8dec177' // admin-password
    }
]

let sessions: Session[] = []

let cameras: Camera[] = [
    { id: '0', name: 'A8207-VE MKII', address: '192.168.1.101' },
    { id: '1', name: 'I8307-VE', niceName: 'My Device', address: '192.168.1.102' },
    { id: '2', name: 'Q3709-PVE', niceName: 'Backyard Cam', address: '192.168.1.103' },
    { id: '3', name: 'P5635-E', address: '192.168.1.104' },
    { id: '4', name: 'M1137-E', niceName: 'Office Lobby', address: '192.168.1.105' },
    { id: '5', name: 'M3216-LVE', address: '192.168.1.106' }
]

let userCameras: UserCamera[] = [
    { userId: '0', cameraId: '0' },
    { userId: '0', cameraId: '2' },
    { userId: '0', cameraId: '3' },
    { userId: '1', cameraId: '1' },
    { userId: '1', cameraId: '4' },
    { userId: '1', cameraId: '5' }
]

const hashPassword = (password: string) => createHash('sha256').update(password).digest('hex')

export const getUser = (userId: string) => users.find((user) => user.id === userId)

export const getUsers = () => users

export const getUserBySessionToken = (token?: string) => {
    const session = sessions.find((currentSession) => currentSession.token === token)

    return session ? getUser(session.userId) : undefined
}

export const loginUser = (username: string, password: string) => {
    const credential = credentials.find(
        (currentCredential) => currentCredential.username.toLowerCase() === username.toLowerCase()
    )

    if (!credential || credential.passwordHash !== hashPassword(password)) {
        return undefined
    }

    const user = getUser(credential.userId)

    if (!user) {
        return undefined
    }

    const token = randomUUID()
    sessions = [...sessions, { token, userId: user.id }]

    return { token, user }
}

export const getCamera = (cameraId: string) => cameras.find((camera) => camera.id === cameraId)

export const getCameras = () => cameras

export const getCamerasForUser = (userId: string) => {
    const cameraIds = userCameras
        .filter((userCamera) => userCamera.userId === userId)
        .map((userCamera) => userCamera.cameraId)

    return cameras.filter((camera) => cameraIds.includes(camera.id))
}

export const userHasCamera = (userId: string, cameraId: string) =>
    userCameras.some((userCamera) => userCamera.userId === userId && userCamera.cameraId === cameraId)

export const cameraBelongsToAnotherUser = (userId: string, cameraId: string) =>
    userCameras.some((userCamera) => userCamera.userId !== userId && userCamera.cameraId === cameraId)

export const createCameraForUser = (userId: string, args: Omit<Camera, 'id'>) => {
    const camera: Camera = { id: `${cameras.length}`, ...args }

    cameras = [...cameras, camera]
    userCameras = [...userCameras, { userId, cameraId: camera.id }]

    return camera
}

export const addCameraToUser = (userId: string, cameraId: string) => {
    if (!userHasCamera(userId, cameraId)) {
        userCameras = [...userCameras, { userId, cameraId }]
    }
}

export const removeCameraFromUser = (userId: string, cameraId: string) => {
    userCameras = userCameras.filter(
        (userCamera) => userCamera.userId !== userId || userCamera.cameraId !== cameraId
    )
}

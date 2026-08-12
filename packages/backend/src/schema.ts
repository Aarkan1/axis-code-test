import { GraphQLError } from 'graphql'
import { createSchema } from 'graphql-yoga'

export type BackendContext = {
    currentUserId?: string
}

const typeDefinition = /* GraphQL */ `
    type Query {
        me: User!
        cameras: [Camera!]!
        camera(id: ID!): Camera
    }

    type Mutation {
        login(name: String!): User!
        addCamera(name: String!, niceName: String, address: String!): Camera!
        addCameraToUser(cameraId: ID!): User!
        removeCameraFromUser(cameraId: ID!): User!
    }

    type User {
        id: ID!
        name: String!
        cameras: [Camera!]!
    }

    type Camera {
        id: ID!
        name: String!
        niceName: String
        address: String!
    }
`

type User = {
    id: string
    name: string
}

type Camera = {
    id: string
    name: string
    niceName?: string
    address: string
}

type UserCamera = {
    userId: string
    cameraId: string
}

const users: User[] = [
    {
        id: '0',
        name: 'Alice'
    },
    {
        id: '1',
        name: 'Bob'
    }
]

let cameras: Camera[] = [
    {
        id: '0',
        name: 'A8207-VE MKII',
        address: '192.168.1.101',
    },
    {
        id: '1',
        name: 'I8307-VE',
        niceName: "My Device",
        address: '192.168.1.102',
    },
    {
        id: '2',
        name: 'Q3709-PVE',
        niceName: "Backyard Cam",
        address: '192.168.1.103',
    },
    {
        id: '3',
        name: 'P5635-E',
        address: '192.168.1.104',
    },
    {
        id: '4',
        name: 'M1137-E',
        niceName: "Office Lobby",
        address: '192.168.1.105',
    },
    {
        id: '5',
        name: 'M3216-LVE',
        address: '192.168.1.106',
    }
]

let userCameras: UserCamera[] = [
    {
        userId: '0',
        cameraId: '0'
    },
    {
        userId: '0',
        cameraId: '2'
    },
    {
        userId: '0',
        cameraId: '3'
    },
    {
        userId: '1',
        cameraId: '1'
    },
    {
        userId: '1',
        cameraId: '4'
    },
    {
        userId: '1',
        cameraId: '5'
    }
]

const getUser = (userId: string) => users.find((user) => user.id === userId)

const getCamera = (cameraId: string) => cameras.find((camera) => camera.id === cameraId)

const getCurrentUser = (context: BackendContext) => {
    if (!context.currentUserId) {
        throw new GraphQLError('You must be logged in to access cameras.')
    }

    const user = getUser(context.currentUserId)

    if (!user) {
        throw new GraphQLError('The logged in user does not exist.')
    }

    return user
}

const getCamerasForUser = (userId: string) => {
    const cameraIds = userCameras
        .filter((userCamera) => userCamera.userId === userId)
        .map((userCamera) => userCamera.cameraId)

    return cameras.filter((camera) => cameraIds.includes(camera.id))
}

const userHasCamera = (userId: string, cameraId: string) =>
    userCameras.some((userCamera) => userCamera.userId === userId && userCamera.cameraId === cameraId)

const cameraBelongsToAnotherUser = (userId: string, cameraId: string) =>
    userCameras.some((userCamera) => userCamera.userId !== userId && userCamera.cameraId === cameraId)

const resolvers = {
    Query: {
        me: (_parent: unknown, _args: unknown, context: BackendContext) => getCurrentUser(context),
        cameras: (_parent: unknown, _args: unknown, context: BackendContext) => {
            const user = getCurrentUser(context)

            return getCamerasForUser(user.id)
        },
        camera: (_parent: unknown, args: Pick<Camera, 'id'>, context: BackendContext) => {
            const user = getCurrentUser(context)

            // Return null instead of another user's camera.
            return userHasCamera(user.id, args.id) ? getCamera(args.id) : null
        }
    },
    Mutation: {
        login: (_parent: unknown, args: Pick<User, 'name'>) => {
            const user = users.find((currentUser) => currentUser.name.toLowerCase() === args.name.toLowerCase())

            if (!user) {
                throw new GraphQLError('User not found.')
            }

            return user
        },
        addCamera: (_parent: unknown, args: Omit<Camera, 'id'>, context: BackendContext) => {
            const id = `${cameras.length}`

            const camera: Camera = {
                id,
                ...args
            }

            cameras = [...cameras, camera]

            return camera
        },
        addCameraToUser: (_parent: unknown, args: { cameraId: string }, context: BackendContext) => {
            const user = getCurrentUser(context)
            const camera = getCamera(args.cameraId)

            if (!camera) {
                throw new GraphQLError('Camera not found.')
            }

            if (cameraBelongsToAnotherUser(user.id, camera.id)) {
                throw new GraphQLError('You cannot add another user\'s camera.')
            }

            if (!userHasCamera(user.id, camera.id)) {
                userCameras = [...userCameras, { userId: user.id, cameraId: camera.id }]
            }

            return user
        },
        removeCameraFromUser: (_parent: unknown, args: { cameraId: string }, context: BackendContext) => {
            const user = getCurrentUser(context)

            userCameras = userCameras.filter(
                (userCamera) => userCamera.userId !== user.id || userCamera.cameraId !== args.cameraId
            )

            return user
        }
    },
    User: {
        cameras: (parent: User) => getCamerasForUser(parent.id)
    }
}

export const schema = createSchema({
    resolvers: [resolvers],
    typeDefs: [typeDefinition]
})
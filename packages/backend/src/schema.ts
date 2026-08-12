import { GraphQLError } from 'graphql'
import { createSchema } from 'graphql-yoga'

import {
    addCameraToUser,
    cameraBelongsToAnotherUser,
    createCameraForUser,
    getCamera,
    getCamerasForUser,
    getUserBySessionToken,
    loginUser,
    removeCameraFromUser,
    userHasCamera,
    type Camera,
    type User
} from './data'

export type BackendContext = {
    sessionToken?: string
}

const typeDefinition = /* GraphQL */ `
    type Query {
        me: User!
        cameras: [Camera!]!
        camera(id: ID!): Camera
    }

    type Mutation {
        login(username: String!, password: String!): AuthPayload!
        addCamera(name: String!, niceName: String, address: String!): Camera!
        addCameraToUser(cameraId: ID!): User!
        removeCameraFromUser(cameraId: ID!): User!
    }

    type AuthPayload {
        token: String!
        user: User!
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

type LoginArgs = {
    username: string
    password: string
}

const getCurrentUser = (context: BackendContext) => {
    const user = getUserBySessionToken(context.sessionToken)

    if (!user) {
        throw new GraphQLError('You must be logged in to access cameras.')
    }

    return user
}

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
        login: (_parent: unknown, args: LoginArgs) => {
            const session = loginUser(args.username, args.password)

            if (!session) {
                throw new GraphQLError('Invalid username or password.')
            }

            return session
        },
        addCamera: (_parent: unknown, args: Omit<Camera, 'id'>, context: BackendContext) => {
            const user = getCurrentUser(context)

            return createCameraForUser(user.id, args)
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

            addCameraToUser(user.id, camera.id)

            return user
        },
        removeCameraFromUser: (_parent: unknown, args: { cameraId: string }, context: BackendContext) => {
            const user = getCurrentUser(context)

            removeCameraFromUser(user.id, args.cameraId)

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

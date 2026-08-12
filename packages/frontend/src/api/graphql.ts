const graphqlEndpoint = 'http://localhost:4000/graphql'

export type User = {
    id: string
    name: string
    isAdmin: boolean
}

export type Camera = {
    id: string
    name: string
    niceName: string | null
    address: string
}

export type AuthPayload = {
    token: string
    user: User
}

export type CamerasResponse = {
    me: User
    cameras: Camera[]
}

export type AdminUser = User & {
    cameras: Camera[]
}

export type AdminDataResponse = {
    users: AdminUser[]
    allCameras: Camera[]
}

type GraphQLResponse<TData> = {
    data?: TData
    errors?: Array<{ message: string }>
}

const loginMutation = /* GraphQL */ `
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            token
            user {
                id
                name
                isAdmin
            }
        }
    }
`

const camerasQuery = /* GraphQL */ `
    query CamerasForCurrentUser {
        me {
            id
            name
            isAdmin
        }
        cameras {
            id
            name
            niceName
            address
        }
    }
`

const adminDataQuery = /* GraphQL */ `
    query AdminData {
        users {
            id
            name
            isAdmin
            cameras {
                id
                name
                niceName
                address
            }
        }
        allCameras {
            id
            name
            niceName
            address
        }
    }
`

const addCameraMutation = /* GraphQL */ `
    mutation AddCamera($userId: ID!, $name: String!, $niceName: String, $address: String!) {
        addCamera(userId: $userId, name: $name, niceName: $niceName, address: $address) {
            id
            name
            niceName
            address
        }
    }
`

const addCameraToUserMutation = /* GraphQL */ `
    mutation AddCameraToUser($userId: ID!, $cameraId: ID!) {
        addCameraToUser(userId: $userId, cameraId: $cameraId) {
            id
            name
            isAdmin
        }
    }
`

const removeCameraFromUserMutation = /* GraphQL */ `
    mutation RemoveCameraFromUser($userId: ID!, $cameraId: ID!) {
        removeCameraFromUser(userId: $userId, cameraId: $cameraId) {
            id
            name
            isAdmin
        }
    }
`

const getErrorMessage = (errors: GraphQLResponse<unknown>['errors']) =>
    errors?.map((error) => error.message).join('\n') ?? 'The backend request failed.'

const fetchGraphQL = async <TData>(query: string, variables?: unknown, token?: string): Promise<TData> => {
    const headers = new Headers({ 'content-type': 'application/json' })

    if (token) {
        // Only the opaque session token is sent after login. Passwords are never stored.
        headers.set('authorization', `Bearer ${token}`)
    }

    const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables })
    })

    const result = (await response.json()) as GraphQLResponse<TData>

    if (!response.ok || result.errors) {
        throw new Error(getErrorMessage(result.errors))
    }

    if (!result.data) {
        throw new Error('The backend returned no data.')
    }

    return result.data
}

export const login = (username: string, password: string) =>
    fetchGraphQL<{ login: AuthPayload }>(loginMutation, { username, password }).then((data) => data.login)

export const fetchCurrentUserCameras = (token: string) => fetchGraphQL<CamerasResponse>(camerasQuery, undefined, token)

export const fetchAdminData = (token: string) => fetchGraphQL<AdminDataResponse>(adminDataQuery, undefined, token)

export const addCamera = (token: string, input: Omit<Camera, 'id'> & { userId: string }) =>
    fetchGraphQL<{ addCamera: Camera }>(addCameraMutation, input, token).then((data) => data.addCamera)

export const addCameraToUser = (token: string, userId: string, cameraId: string) =>
    fetchGraphQL(addCameraToUserMutation, { userId, cameraId }, token)

export const removeCameraFromUser = (token: string, userId: string, cameraId: string) =>
    fetchGraphQL(removeCameraFromUserMutation, { userId, cameraId }, token)

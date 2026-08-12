const graphqlEndpoint = 'http://localhost:4000/graphql'

export type User = {
    id: string
    name: string
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
            }
        }
    }
`

const camerasQuery = /* GraphQL */ `
    query CamerasForCurrentUser {
        me {
            id
            name
        }
        cameras {
            id
            name
            niceName
            address
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

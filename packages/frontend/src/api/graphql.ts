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

export type CamerasResponse = {
    me: User
    cameras: Camera[]
}

type GraphQLResponse<TData> = {
    data?: TData
    errors?: Array<{ message: string }>
}

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
    errors?.map((error) => error.message).join('\n') ?? 'Could not load cameras.'

const fetchGraphQL = async <TData>(query: string, userId: string): Promise<TData> => {
    const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            // The backend scopes all camera data from this logged-in user id.
            'x-user-id': userId
        },
        body: JSON.stringify({ query })
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

export const fetchCurrentUserCameras = (userId: string) => fetchGraphQL<CamerasResponse>(camerasQuery, userId)

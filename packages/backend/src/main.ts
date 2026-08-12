import { schema, type BackendContext } from "./schema"
import { createYoga } from "graphql-yoga"
import { createServer } from "node:http"

const getBearerToken = (authorization: string | null) => {
    if (!authorization?.startsWith('Bearer ')) {
        return undefined
    }

    return authorization.slice('Bearer '.length)
}

const yoga = createYoga<BackendContext>({
    schema,
    context: ({ request }) => ({
        // The frontend stores only this opaque token after login.
        sessionToken: getBearerToken(request.headers.get('authorization'))
    })
})
const server = createServer(yoga)

server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql')
})
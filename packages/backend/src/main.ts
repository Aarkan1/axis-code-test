import { schema, type BackendContext } from "./schema"
import { createYoga } from "graphql-yoga"
import { createServer } from "node:http"

const yoga = createYoga<BackendContext>({
    schema,
    context: ({ request }) => ({
        // The frontend sends this after login. Resolvers use it to scope data.
        currentUserId: request.headers.get('x-user-id') ?? undefined
    })
})
const server = createServer(yoga)

server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql')
})
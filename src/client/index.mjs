import {createClient} from "@anio-node-foundation/http-socket"
import createRequestResponseProtocol from "@anio-js-foundation/request-response-protocol"

export default async function(endpoint, request_handler) {
	const client = await createClient(endpoint)

	const protocol = createRequestResponseProtocol(client, `Client ${client.id.slice(0, 7)} -> Server`)

	protocol.requestHandler = request_handler

	await protocol.ready()

	return protocol
}

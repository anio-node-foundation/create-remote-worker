import {createClient} from "@anio-js-foundation/http-socket"
import createRequestResponseProtocol from "@anio-js-foundation/request-response-protocol"

export default async function(endpoint, request_handler) {
	const client = await createClient(endpoint)

	const protocol = createRequestResponseProtocol(client)

	protocol.requestHandler = request_handler

	await protocol.ready()
}

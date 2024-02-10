import {createServer} from "@anio-js-foundation/http-socket"
import eventEmitter from "@anio-js-core-foundation/simple-event-emitter"
import createRequestResponseProtocol from "@anio-js-foundation/request-response-protocol"

export default async function(port, base_url, onHTTPResourceRequest = () => {}) {
	let instance = {
		connected_clients: new Map(),
		public_interface: {
			getClients() {
				return Array.from(instance.connected_clients.keys())
			},

			getClientById(client_id) {
				if (!instance.connected_clients.has(client_id)) {
					throw new Error(`Unknown client '${client_id}'.`)
				}

				return instance.connected_clients.get(client_id)
			}
		}
	}

	const server = await createServer(port, base_url)

	const event_emitter = eventEmitter(["connect", "disconnect"])

	const dispatchEvent = event_emitter.install(instance.public_interface)

	instance.dispatchEvent = dispatchEvent

	server.on("httpRequest", ({request, response}) => {
		onHTTPResourceRequest(request, response)
	})

	server.on("connect", client => {
		const protocol = createRequestResponseProtocol(client, client.id)

		instance.connected_clients.set(
			client.id, protocol
		)

		protocol.ready().then(() => {
			instance.dispatchEvent("connect", protocol)
		})
	})

	server.on("disconnect", (client_id) => {
		const client = instance.connected_clients.get(client_id)

		instance.dispatchEvent("disconnect", client.connection_id)

		instance.connected_clients.delete(client_id)
	})

	instance.public_interface.port = server.port

	return instance.public_interface
}

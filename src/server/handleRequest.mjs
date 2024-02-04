import setupClient from "./setupClient.mjs"
import resetClientTimeoutTimer from "./resetClientTimeoutTimer.mjs"
import handleClientRequest from "./handleClientRequest.mjs"

export default async function(context, raw_url) {
	const {instance, request, response} = context

	let url = instance.node_modules.path.normalize(raw_url)

	try {
		if (url === "/registerClient") {
			const client = setupClient(context)

			response.write(JSON.stringify({status: "ok", id: client.id}))
			response.end()

			return
		}

		if (url.startsWith("/client/")) {
			const parts = url.slice("/client/".length).split("/")

			if (parts.length !== 2) {
				throw new Error(`invalid request`)
			}

			const [client_id, method] = parts

			if (!(client_id in instance.clients_object)) {
				console.log("invalid client id", client_id, instance.clients_object)

				throw new Error(`invalid client id`)
			}

			resetClientTimeoutTimer(context, client_id)

			const client = instance.clients_object[client_id]

			handleClientRequest(context, method, client)

			return
		}

		throw new Error(`invalid request`)
	} catch (error) {
		response.statusCode = 400

		response.write(JSON.stringify({
			status: "error",
			error: error.message,
			destroy_client: error.message === `invalid client id`
		}))

		response.end()
	}
}

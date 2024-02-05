import createMutex from "@anio-js-core-foundation/create-async-mutex"
import createPromise from "@anio-js-core-foundation/create-promise"
import handleRequest from "./handleRequest.mjs"

export default async function createServer(port, base_url, events = {}) {
	const ready_promise = createPromise()

	const http = await import("node:http")
	const path = await import("node:path")

	const mutex = await createMutex()

	let instance = {
		node_modules: {
			path
		},

		options: {
			events
		},

		clients_object: {}
	}

	const server = http.createServer(async (request, response) => {
		if (request.url.startsWith(base_url)) {
			const release = await mutex.acquire()

			const context = {instance, request, response}

			await handleRequest(
				context, request.url.slice(base_url.length)
			)

			await release()
		} else if ("onHTTPResourceRequest" in events) {
			events.onHTTPResourceRequest(request, response)
		}
	})

	server.on("error", ready_promise.reject)

	server.listen(port, () => {
		ready_promise.resolve({
			getClientById(client_id) {
				if (!(client_id in instance.clients_object)) {
					throw new Error(`No client with id '${client_id}'.`)
				}

				return instance.clients_object[client_id].public_interface
			},
			port: server.address().port
		})
	})

	return await ready_promise.promise
}

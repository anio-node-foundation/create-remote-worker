import {setupSlave} from "@anio-js-foundation/master-slave-protocol"
import makeJSONFetchRequest from "./makeJSONFetchRequest.mjs"

export default async function setupClient(endpoint, request_handler) {
	const client = await makeJSONFetchRequest(`${endpoint}/registerClient`)
	let public_interface = {}
	let destroyed = false

	const checkNeedDestroyClient = (response) => {
		if (!("destroy_client" in response)) return

		if (!response.destroy_client) return

		destroyed = true
	}

	const slave = setupSlave(async (msg) => {
		const response = await makeJSONFetchRequest(`${endpoint}/client/${client.id}/sendMessage`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(msg)
		})

		checkNeedDestroyClient(response)
	}, request_handler)

	let poll_timer = null

	async function poll() {
		if (destroyed) {
			return
		}

		try {
			const response = await makeJSONFetchRequest(
				`${endpoint}/client/${client.id}/getNewMessages`
			)

			checkNeedDestroyClient(response)

			for (const message of response.messages) {
				slave.onMessage(message)
			}
		} catch {}

		poll_timer = setTimeout(poll, 250)
	}

	poll_timer = setTimeout(poll, 0)

	public_interface.destroy = function() {
		destroyed = true
	}

	return public_interface
}

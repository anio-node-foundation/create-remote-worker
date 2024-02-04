import destroyClient from "./destroyClient.mjs"

export default function(context, client_id) {
	const {instance} = context

	if (instance.clients_object[client_id].timeout_timer !== null) {
		clearTimeout(instance.clients_object[client_id].timeout_timer)
	}

	instance.clients_object[client_id].timeout_timer = setTimeout(() => {
		destroyClient(context, client_id)

		if ("onClientDisconnected" in instance.options.events) {
			setTimeout(
				instance.options.events.onClientDisconnected, 0,
				client_id
			)
		}
	}, 2000)
}

export default function(context, client_id) {
	const {instance} = context

	instance.clients_object[client_id].master_interface.rejectPendingRequests(
		"Client connection time'd out."
	)

	instance.clients_object[client_id].master_interface.close()

	delete instance.clients_object[client_id]
}

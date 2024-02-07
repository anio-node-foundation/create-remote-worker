import {createMasterInterface} from "@anio-js-foundation/master-slave-protocol"
import createRandomIdentifier from "@anio-js-core-foundation/create-random-identifier"
import resetClientTimeoutTimer from "./resetClientTimeoutTimer.mjs"

export default function setupClient(context) {
	const {instance} = context
	const client_id = createRandomIdentifier(32)

	let client_object = {
		message_queue: [],
		public_interface: {},
		slave: null,
		timeout_timer: null
	}

	client_object.master_interface = createMasterInterface(msg => {
		client_object.message_queue.push(msg)
	})

	client_object.public_interface = {
		id: client_id,

		sendRequest(...args) {
			return client_object.master_interface.sendRequest(...args)
		},

		getPushedMessages() {
			return client_object.slave.getPushedMessages()
		}
	}

	client_object.connected = async () => {
		return await client_object.master_interface.slaveReady()
	}

	instance.clients_object[client_id] = client_object

	// dispatch connected event when slave (client) is ready
	client_object.master_interface.slaveReady().then((slave) => {
		client_object.slave = slave

		if ("onClientConnected" in instance.options.events) {
			setTimeout(
				instance.options.events.onClientConnected, 0,
				client_object.public_interface
			)
		}
	})

	resetClientTimeoutTimer(context, client_id)

	return {id: client_id, instance: client_object}
}

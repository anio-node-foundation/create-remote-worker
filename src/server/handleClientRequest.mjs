export default function(context, method, client) {
	const {request, response} = context

	if (method === "getNewMessages") {
		response.write(JSON.stringify({"status": "ok", "messages": client.message_queue}))
		response.end()

		client.message_queue = []

		return
	}

	if (method === "sendMessage") {
		let body = ""

		request.on("data", chunk => {
			body += chunk
		})

		request.on("end", () => {
			client.master_interface.onMessage(JSON.parse(body))

			response.write(JSON.stringify({"status": "ok"}))
			response.end()
		})

		return
	}

	throw new Error(`invalid request`)
}

import {createServer} from "../dist/package.mjs"
import fs from "node:fs"

const server = await createServer(0, "/endpoint", {
	/* todo: */
	client_timeout: 2000,

	onHTTPResourceRequest(req, res) {
		try {
			if (req.url.endsWith(".mjs")) {
				res.setHeader("Content-Type", "text/javascript")
			}

			res.write(fs.readFileSync("./" + req.url))
			res.end()
		} catch {
			res.write("err")
			res.end()
		}
	},

	async onClientConnected(client) {
		console.log("sending request to worker", await client.sendRequest({
			cmd: "test"
		}))
	},

	onClientDisconnected(client_id) {
		console.log("client disconnected", client_id)
	}
})

console.log("server listening on", server.port)

setInterval(() => {
	console.log("clients connected to the server", server.getClients())

	for (const c of server.getClients()) {
		console.log(server.getClientById(c).getPushedMessages())
	}
}, 1000)

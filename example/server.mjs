import {createServer} from "../dist/package.mjs"
import fs from "node:fs"

const server = await createServer(5555, "/endpoint", (req, res) => {
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
})

server.on("attached", async (client) => {
	console.log(`client ${client.connection_id} attached.`)

	console.log(await client.sendRequest("Hello!"))
})

console.log("server listening on", `http://localhost:${server.port}/`)

setInterval(async () => {
	console.log("clients connected to the server", server.getClients())

	for (const id of server.getClients()) {
		const client = server.getClientById(id)

		console.log(
			id, await client.sendRequest("ping")
		)
	}
}, 1000)

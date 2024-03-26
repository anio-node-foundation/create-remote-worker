import {createClient} from "../build/package.mjs"

async function requestHandler(request) {
	console.log("got request", request)

	return "worker received request: " + JSON.stringify(request)
}

const client = await createClient(`${document.location.origin}/endpoint`, requestHandler)

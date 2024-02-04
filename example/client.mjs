import {setupClient} from "../dist/package.mjs"

async function requestHandler(request) {
	console.log("got request", request)

	return "worker received request: " + JSON.stringify(request)
}

window.client = await setupClient(
	document.location.origin + "/endpoint/", requestHandler, /* todo */ {
		poll_interval: 250
	}
)

export default async function(...args) {
	const response = await fetch(...args)

	return await response.json()
}

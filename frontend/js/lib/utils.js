// Returns the specified property from a given object. Allows retrieval of
// nested properties via dot syntax. Returns undefined if key doesn't
// exist
// object = touched/error
export function getObjectPath(obj, path) {
	// Replace array notation ([]) with .
	path = path.replace(/\[([^\]]*)\]/g, ".$1")
	let keys = path.split(".")

	if (obj == null || typeof obj !== "object") {
		return obj
	}

	for (let i = 0; i < keys.length; i++) {
		obj = obj[keys[i]]
		if (obj == null || typeof obj !== "object") {
			break
		}
	}
	return obj
}

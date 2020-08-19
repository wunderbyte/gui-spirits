/**
 * Store anything in the state. The weird symbol marks the state as mutable
 * so that the framework doesn't `Object.freeze` the whole thing in devmode.
 * @returns {Object}
 */
export function SimpleStatePlugin() {
	return Object.assign(Object.create(null), {
		[Symbol.for(Object.freeze)]: false,
	});
}

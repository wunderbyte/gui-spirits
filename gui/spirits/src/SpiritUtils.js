/**
 * Declare spirit or plugin frozen during development while noting that
 * this doesn't for nested properties (or plugins that are not objects).
 * @param {Spirit|Plugin} thing
 * @param {boolean} prod
 * @returns {Spirit|Plugin}
 */
export function frozen(thing, prod) {
	return prod
		? thing
		: typeof thing === 'object'
		? mutable(thing)
			? thing
			: Object.freeze(thing)
		: thing;
}

// Scoped ......................................................................

/**
 * Thing marked as mutable (even during development)?
 * (value must be set to `false` and not `undefined`)
 * @param {Spirit|Plugin} thing
 * @returns {boolean}
 */
function mutable(thing) {
	return thing[Symbol.for(Object.freeze)] === false;
}

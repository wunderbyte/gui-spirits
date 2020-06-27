/**
 * Create from object a new object with values cast to numbers and booleans etc.
 * TODO: Move into `@utils/data-utils`
 * @param {Object} params
 * @returns {Object}
 */
export function castAll(params) {
	return fromEntries(Object.entries(params).map(castEntry));
}

/**
 * Autocast input to an inferred type. "123" will
 * return a number, "false" will return a boolean.
 * TODO: Move into `@utils/data-utils`
 * @param {string|number|boolean|null|undefined} string
 * @returns {string|number|boolean}
 */
export function cast(input) {
	const s = String(input).trim();
	switch (s) {
		case 'null':
			return null;
		case 'undefined':
			return undefined;
		case 'true':
		case 'false':
			return s === 'true';
		default:
			return String(parseInt(s, 10)) === s
				? parseInt(s, 10)
				: String(parseFloat(s)) === s
				? parseFloat(s)
				: String(input);
	}
}

/**
 * @alias {cast}
 * TODO: Move into `@utils/data-utils`
 * @param {string} string
 * @returns {string|number|boolean}
 */
export function castOne(string) {
	return cast(string);
}

// Scoped ......................................................................

/**
 * Cast string value.
 * @param {Array<string, string>} entry
 */
function castEntry([key, value]) {
	return [key, cast(value)];
}

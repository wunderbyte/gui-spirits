/**
 * Autocast input to an inferred type. "123" will
 * return a number, "false" will return a boolean.
 * @param {string|number|boolean|null|undefined} input
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

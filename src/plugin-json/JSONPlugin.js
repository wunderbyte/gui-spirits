/**
 * Working with JSON from embedded `<script type="application/json">`
 * TODO: Support invalid JSON (with some simple hand-coded JS syntax)
 * @param {CustomElement} elm
 * @returns {CSSPlugin}
 */
export default function JSONPlugin(elm) {
	return {
		/**
		 * Parse JSON to object or array. Note that is must be valid JSON (for now).
		 * @param {string} selector Used to locate the script
		 * @param {Node|Document} [context] Where to locate the script
		 * @returns {Object|Array}
		 */
		read(selector, context = elm) {
			const text = context.querySelector(selector).textContent;
			try {
				return JSON.parse(text);
			} catch (exception) {
				console.error(exception);
				console.error(text);
			}
		},

		/**
		 * Get JSON text as string (eg. for processing in Worker).
		 * @param {string} selector Used to locate the script
		 * @param {Node|Document} [context] Where to locate the script
		 * @returns {string}
		 */
		text(selector, context = elm) {
			return context.querySelector(selector).textContent;
		},
	};
}

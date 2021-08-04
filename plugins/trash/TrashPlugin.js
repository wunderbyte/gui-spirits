/**
 * The TrashPlugin collects functions to call when the component gets removed.
 */
export default function TrashPlugin() {
	const actions = new Set();
	const plugin = {
		/**
		 * Register function to call. Returns the function.
		 * @param {Function} action
		 * @returns {Function} action
		 */
		collect(action) {
			actions.add(validate(action, elm));
			return action;
		},

		/**
		 * Call collected functions and clear the collection.
		 */
		empty() {
			actions.forEach((action) => action());
			actions.clear();
		},

		/**
		 * Component gets removed! Call everything.
		 */
		onexorcise() {
			plugin.empty();
		},
	};
	return plugin;
}

// Scoped ......................................................................

/**
 * Confirm that really received a function since
 * things will not immediately break otherwise.
 * @param {Function} action
 * @returns {Function}
 */
function validate(action, elm) {
	if (!action || !action.call || !action.apply) {
		throw new Error(`Function expected (${elm.localName})`);
	}
	return action;
}

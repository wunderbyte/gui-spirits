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
			actions.add(action);
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

import { addCallback, runCallbacks, nonCallbacks } from '@gui/callback-utils';
import { plugin, unplug } from './SpiritPlugins';
import { frozen } from './SpiritUtils';

export const [detach, attach, exorcise] = [Symbol(), Symbol(), Symbol()];

/**
 * @param {CustomElement} element
 * @param {Map<string, Function>} plugins
 * @param {boolean} prod
 * @returns {Spirit}
 */
export function Spirit(element, plugins, prod) {
	const accessed = []; // tracking active plugins
	return frozen(
		Object.defineProperties(
			spirit(element, accessed),
			plugin(element, accessed, plugins, prod)
		),
		prod
	);
}

/**
 * Spirit props and methods.
 * @param {Element} element
 * @param {Array<Object>} accessed
 * @returns {Object}
 */
function spirit(element, accessed) {
	let set1, set2, set3;
	return {
		/**
		 * Support recursive destructuring.
		 * @type {Spirit}
		 */
		get spirit() {
			return this;
		},

		/**
		 * Expose the element.
		 * @type {CustomElement}
		 */
		get element() {
			return element;
		},

		/**
		 * Disconnect spirit.
		 */
		[detach]() {
			runCallbacks(set1);
		},

		/**
		 * Reconnect spirit.
		 */
		[attach]() {
			runCallbacks(set2);
		},

		/**
		 * Exorcise spirit plus plugins and clear lifecycle callbacks.
		 */
		[exorcise]() {
			runCallbacks(set3);
			nonCallbacks(set1, set2, set3);
			unplug(accessed);
		},

		/**
		 * Add detach callback and return function to remove the callback.
		 * @param {Function} cb
		 * @returns {Function}
		 */
		ondetach(cb) {
			return addCallback(cb, (set1 = set1 || new Set()));
		},

		/**
		 * Add attach callback and return function to remove the callback.
		 * @param {Function} cb
		 * @returns {Function}
		 */
		onattach(cb) {
			return addCallback(cb, (set2 = set2 || new Set()));
		},

		/**
		 * Add exorcise callback and return function to remove the callback.
		 * @param {Function} cb
		 * @returns {Function}
		 */
		onexorcise(cb) {
			return addCallback(cb, (set3 = set3 || new Set()));
		},
	};
}

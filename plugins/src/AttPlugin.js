import { cast } from '@utils/object-utils';
import { MapSet } from '@utils/data-utils';

/**
 * Working with attributes.
 * @param {HTMLElement} elm
 * @returns {AttPlugin}
 */
export function AttPlugin(elm) {
	let obs, map;
	const plugin = {
		/**
		 * Attribute `id`
		 * @type {string}
		 */
		get id() {
			return elm.id;
		},

		/**
		 * Get attribute value cast to an inferred type.
		 * @param {string} name
		 * @param {string|null} backup Returns this if no attribute found
		 * @returns {string|number|boolean|null|undefined}
		 */
		get(name, backup = null) {
			return cast(elm.getAttribute(name) ?? backup);
		},

		/**
		 * Set attribute.
		 * @param {string} name
		 * @param {string|number|boolean} value
		 * @returns {this}
		 */
		set(name, value) {
			elm.setAttribute(name, String(value));
			return plugin;
		},

		/**
		 * Has attribute?
		 * @param {string} name
		 * @returns {boolean}
		 */
		has(name) {
			return elm.hasAttribute(name);
		},

		/**
		 * Remove attribute (sticking to the semantics of a {Map} here).
		 * @param {string} name
		 * @returns {this}
		 */
		delete(name) {
			elm.removeAttribute(name);
			return plugin;
		},

		/**
		 * Add attribute listener(s). Until the {MutationObserver} interface
		 * supports an `unobserve` method, we're gonna have to use an unique
		 * observer for each single element in order to prevent memory leaks.
		 * TODO: If performant (!) single observer could watch entire DOM tree
		 * @see https://github.com/whatwg/dom/issues/126
		 * @param {string|Array<string>} names
		 * @param {Function} cb
		 */
		on(names, cb) {
			map = map || new MapSet();
			obs = obs || new MutationObserver(run);
			obs.observe(elm, { attributes: true });
			each(names, (name) => add(elm, map, name, cb));
			return plugin;
		},

		/**
		 * Remove attribute listener(s).
		 * @param {string|Array<string>} name
		 * @param {Function} cb
		 */
		off(names, cb) {
			each(names, (name) => del(elm, map, name, cb));
			return plugin;
		},

		/**
		 * @param {HTMLElement} newelm
		 * @returns {AttPlugin}
		 */
		wrap(newelm) {
			return AttPlugin(newelm);
		},

		/**
		 * Unregister attribute listeners and release the observer.
		 */
		onexorcise() {
			obs && obs.disconnect();
			map &&
				map.forEach((set, name) => {
					set.forEach((cb) => {
						del(elm, map, name, cb);
					});
				});
		},
	};
	return plugin;
}

// Scoped ......................................................................

/**
 * Semi-private property tracking attribute listeners.
 */
const onchange = Symbol('onattributechange');

/**
 * Implement attribute listener via strange expando method.
 * @param {ComponentElement} elm
 * @param {MapSet<string, Set<Function>>} map
 * @param {string} name
 * @param {Function} cb
 */
function add(elm, map, name, cb) {
	map.add(name, cb);
	map.size === 1 &&
		(elm[onchange] = (name) => {
			map.has(name) &&
				map.get(name).forEach((cb) => {
					cb(cast(elm.getAttribute(name)));
				});
		});
}

/**
 * Remove attribute listener.
 * @param {ComponentElement} elm
 * @param {MapSet<string, Set<Function>>} map
 * @param {string} name
 * @param {Function} cb
 */
function del(elm, map, name, cb) {
	map.del(name, cb);
	map.size === 0 && delete elm[onchange];
}

/**
 * Poke the strange method whenever attributes change.
 * @param {Array<MutationRecord>} records
 */
function run(records) {
	records.forEach((record) => {
		record.target[onchange](record.attributeName);
	});
}

/**
 * Always iterate as array even if not.
 * Splits spaces into multiple entries.
 * TODO: Split all types of whitespaces
 * @param {string|Array<string>} types
 * @param {Function} action
 */
export function each(types, action) {
	[].concat(types.split ? types.split(' ') : types).forEach(action);
}

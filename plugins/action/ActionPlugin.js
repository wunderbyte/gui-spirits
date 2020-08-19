import { MapSet } from '@utils/data-utils';
import { Action } from './Action';

/**
 * Stamp the secret method.
 * @type {Symbol}
 */
const onaction = Symbol('onaction');

/**
 * Tracking elements on stage that have booted this plugin
 * so that we may trigger broadcasts without DOM traversal.
 * @type {Set<SpiritElement>}
 */
const allworld = new Set();

/*
 * Dispatch up the tree, down the tree or all over the place.
 */
const [ASCEND, DESCEND, BROADCAST] = [0, 1, 2];

/**
 * Working with attributes.
 * @param {SpiritElement} elm
 * @returns {AttPlugin}
 */
export function ActionPlugin(elm, prod) {
	const map = new MapSet();
	const run = (dir, type, data) => dispatch(dir, elm, type, data, prod);
	const plugin = {
		/**
		 * Add action listener(s).
		 * @param {string|Array<string>} types
		 * @param {Function} cb
		 * @returns {this}
		 */
		on(types, cb) {
			each(types, (type) => map.add(type, cb));
			elm[onaction] ??= testaction(map);
			return plugin;
		},

		/**
		 * Remove action listener(s).
		 * @param {string|Array<string>} types
		 * @param {Function} cb
		 * @returns {this}
		 */
		off(types, cb) {
			each(types, (type) => map.del(type, cb));
			map.size === 0 && delete elm[onaction];
			return plugin;
		},

		/**
		 * Add auto-removing action listeners(s)
		 * @param {string|Array<string>} types
		 * @param {*} cb
		 */
		once(types, cb) {
			each(types, (type) => {
				plugin.on(type, function once(action) {
					plugin.off(type, once);
					cb(action);
				});
			});
			return plugin;
		},

		/**
		 * Dispatch action ascending.
		 * @param {string} type
		 * @param {?} [data]
		 * @returns {this}
		 */
		ascend(type, data = null) {
			run(ASCEND, type, data);
			return plugin;
		},

		/**
		 * Dispatch action descending.
		 * @param {string} type
		 * @param {?} [data]
		 * @returns {this}
		 */
		descend(type, data = null) {
			run(DESCEND, type, data);
			return plugin;
		},

		/**
		 * Dispatch action globally.
		 * @param {string} type
		 * @param {?} [data]
		 * @returns {this}
		 */
		broadcast(type, data = null) {
			run(BROADCAST, type, data);
			return plugin;
		},

		/**
		 * Cleanup.
		 */
		onexorcise() {
			delete elm[onaction];
			allworld.delete(elm);
			map.clear();
		},
	};
	allworld.add(elm);
	return plugin;
}

// Scoped ......................................................................

/**
 * Always iterate as array even if not.
 * Splits spaces into multiple entries.
 * @param {string|Array<string>} types
 * @param {Function} action
 */
function each(types, action) {
	[].concat(types.split ? types.split(' ') : types).forEach(action);
}

// Dispatching .................................................................

/**
 *
 * @param {string} dir
 * @param {HTMLElement} elm
 * @param {string} type
 * @param {?} data
 */
function dispatch(dir, elm, type, data, prod) {
	const action = freeze(new Action(elm, type, data), prod);
	dir === BROADCAST
		? broadcast(elm, action)
		: dir === ASCEND
		? ascend(elm.parentElement, action)
		: descend(elm.firstElementChild, action);
}

/**
 * Freeze the thing in devmode. Note that this
 * will not freeze the action data (payload).
 * @param {Action} action
 * @param {boolean} prod
 * @returns {Action}
 */
function freeze(action, prod) {
	return prod ? action : Object.freeze(action);
}

/**
 * Broadcast {Action} globally.
 * @param {HTMLElement} elm
 * @param {Action} action
 */
function broadcast(elm, action) {
	allworld.forEach((other) => {
		other !== elm && tryaction(other, action);
	});
}

/**
 * Dispatch {Action} upwards
 * @param {HTMLElement} elm
 * @param {Action} action
 */
function ascend(elm, action) {
	elm && tryaction(elm, action);
	elm && ascend(elm.parentElement, action);
}

/**
 * Dispatch {Action} downwards
 * @param {HTMLElement} elm
 * @param {Action} action
 */
function descend(elm, action) {
	elm && tryaction(elm, action);
	elm && descend(elm.firstElementChild, action);
	elm && descend(elm.nextElementSibling, action);
}

/**
 * Check for secret method and run it to potentially match
 * the {Action} with the element (see function `testaction`).
 * @param {SpiritElement} elm
 * @param {Action} action
 */
function tryaction(elm, action) {
	!action.consumed && elm[onaction] && elm[onaction](action);
}

// Evaluating ..................................................................

/**
 * Generate the secret `[onaction]` method.
 * @param {MapSet} map
 * @returns {Function}
 */
function testaction(map) {
	return ({ type, action }) =>
		map.has(type) && runaction(action, Array.from(map.get(type)));
}

/**
 * Run callbacks for Action.
 * @param {Action} action
 * @param {Array<Function>} cbs
 */
function runaction(action, cbs) {
	cbs.every((cb) => {
		cb(action);
		return !action.consumed;
	});
}

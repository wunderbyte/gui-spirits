import { MapSet } from '@utils/data-utils';

const onaction = Symbol('onaction');

class Action {
	action = this;
	consumed = false;
	constructor(target, value) {
		Object.assign(this, {
			target,
			value,
		});
	}
	consume() {
		Object.assign(this, {
			consumed: true,
		});
	}
}

/**
 * Working with attributes.
 * @param {HTMLElement} elm
 * @returns {AttPlugin}
 */
export function ActionPlugin(elm) {
	const map = new MapSet();
	const plugin = {
		on(types, cb) {
			each(types, (type) => map.add(type, cb));
			elm[onaction] ??= test(map);
			return plugin;
		},
		off(types, cb) {
			each(types, (type) => map.del(type, cb));
			return plugin;
		},
		trigger(type, value) {
			return plugin;
		},
		ascend(type, value) {
			return plugin;
		},
		descend(type, value) {
			return plugin;
		},
		broadcast(type, value) {
			return plugin;
		},
		onexorcise() {
			delete elm[onaction];
			map.clear();
		},
	};
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

/**
 * @param {MapSet} map 
 * @returns {Function}
 */
function test(map) {
	return (type, value) =>
		map.has(type) && run(new Action(type, value), Array.from(map.get(type)));
}

/**
 * @param {Action} action 
 * @param {Array<Function>} cbs 
 */
function run(action, cbs) {
	cbs.every((cb) => {
		cb(action);
		return !action.consumed;
	});
}

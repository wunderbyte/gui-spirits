import { MapSet } from '@utils/data-utils';

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

/**
 * Tracking consumed Actions (not as a property on
 * the Action since we'll freeze that in devmode).
 * @type {WeakSet<Action>}
 */
const consumed = new WeakSet();

/*
 * Dispatch up the tree, down the tree or all over the place.
 */
const [ASCEND, DESCEND, BROADCAST] = [0, 1, 2];

/**
 * TODO: Object.freeze this in devmode except for `consumed` somehow :/
 */
class Action {
	constructor(target, type, value) {
		Object.assign(this, {
			action: this,
			target,
			type,
			value,
		});
	}
	consume() {
		consumed.add(this);
	}
}

/**
 * Working with attributes.
 * @param {HTMLElement} elm
 * @returns {AttPlugin}
 */
export function ActionPlugin(elm, prod) {
	const map = new MapSet();
	const run = (dir, type, value) => dispatch(dir, elm, type, value, prod);
	const plugin = {
		on(types, cb) {
			each(types, (type) => map.add(type, cb));
			elm[onaction] ??= testaction(map);
			specials(prod);
			return plugin;
		},
		off(types, cb) {
			each(types, (type) => map.del(type, cb));
			map.size === 0 && delete elm[onaction];
			return plugin;
		},
		ascend(type, value) {
			run(ASCEND, type, value);
			return plugin;
		},
		descend(type, value) {
			run(DESCEND, type, value);
			return plugin;
		},
		broadcast(type, value) {
			run(BROADCAST, type, value);
			return plugin;
		},
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
 * @param {?} value
 */
function dispatch(dir, elm, type, value, prod) {
	const action = freeze(new Action(elm, type, value), prod);
	dir === BROADCAST
		? broadcast(elm, action)
		: dir === ASCEND
		? ascend(elm.parentElement, action)
		: descend(elm.firstElementChild, action);
}

/**
 * Freeze the thing in devmode. Note that this
 * will not freeze the action value (payload).
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
 * @param {HTMLElement} elm
 * @param {Action} action
 */
function tryaction(elm, action) {
	!consumed.has(action) && elm[onaction] && elm[onaction](action);
}

// Evaluating ..................................................................

/**
 * Generate the secret `[onaction]` method.
 * @param {MapSet} map
 * @returns {Function}
 */
function testaction(map) {
	return (action) =>
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
		return !consumed.has(action);
	});
}

// HTML specials ...............................................................

/**
 * @param {boolean} prod
 */
function specials(prod) {
	if (!specials.setup) {
		document.addEventListener('click', (e) => special(e.target, prod));
		specials.setup = true;
	}
}

/**=
 * @param {HTMLElement} elm
 * @param {boolean} prod
 */
function special(elm, prod) {
	elm
		? elm.dataset.action
			? trigger(elm, prod)
			: special(elm.parentElement, prod)
		: void false;
}

/**
 * @param {HTMLElement} elm
 * @param {boolean} prod
 * @param {DOMStringMap} dataset
 */
function trigger(elm, prod, { action, value } = elm.dataset) {
	dispatch(ASCEND, elm, action, value ?? elm.value, prod);
}

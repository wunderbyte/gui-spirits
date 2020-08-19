import { MapSet } from '@utils/data-utils';
import { Command } from './Command';

/**
 * Stamp the secret method.
 * @type {Symbol}
 */
const oncommand = Symbol('oncommand');

/**
 * Working with attributes.
 * @param {SpiritElement} elm
 * @returns {CommandPlugin}
 */
export function CommandPlugin(elm, prod) {
	const map = new MapSet();
	const plugin = {
		/**
		 * Add command listener(s).
		 * @param {string|Array<string>} types
		 * @param {Function} cb
		 * @returns {this}
		 */
		on(types, cb) {
			each(types, (type) => map.add(type, cb));
			elm[oncommand] ??= testcommand(map);
			setup(prod);
			return plugin;
		},

		/**
		 * Remove command listener(s).
		 * @param {string|Array<string>} types
		 * @param {Function} cb
		 * @returns {this}
		 */
		off(types, cb) {
			each(types, (type) => map.del(type, cb));
			map.size === 0 && delete elm[oncommand];
			return plugin;
		},

		/**
		 * Add auto-removing command listeners(s)
		 * @param {string|Array<string>} types
		 * @param {*} cb
		 */
		once(types, cb) {
			each(types, (type) => {
				plugin.on(type, function once(command) {
					plugin.off(type, once);
					cb(command);
				});
			});
			return plugin;
		},

		/**
		 * Cleanup.
		 */
		onexorcise() {
			delete elm[oncommand];
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
 * @param {Function} command
 */
function each(types, command) {
	[].concat(types.split ? types.split(' ') : types).forEach(command);
}

/**
 * Autocast value to an inferred type. '123' will
 * return a number, `false` will return a boolean.
 * TODO: Cast objects, arrays and JSON-looking data.
 * @param {string|number|boolean|null|undefined} string
 * @returns {string|number|boolean}
 */
export function cast(value) {
	const s = String(value).trim();
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
				: String(value);
	}
}

// Evaluating ..................................................................

/**
 * Generate the secret `[oncommand]` method.
 * @param {MapSet} map
 * @returns {Function}
 */
function testcommand(map) {
	return ({ type, command }) =>
		map.has(type) && runcommand(command, Array.from(map.get(type)));
}

/**
 * Run callbacks for Command.
 * @param {Command} command
 * @param {Array<Function>} cbs
 */
function runcommand(command, cbs) {
	cbs.every((cb) => {
		cb(command);
		return !command.consumed;
	});
}

// Dispatching .................................................................

/**
 * TODO: This in the ShadowRoot, but how to avoid *creating* it?
 * TODO: Form field specials `oninput`, `onchange`, `paste` etc.
 * Checkboxes should trigger boolean or string values (if value).
 * @param {boolean} prod
 */
function setup(prod) {
	if (!setup.done) {
		document.addEventListener('click', (e) => onclick(e, e.target, prod));
		setup.done = true;
	}
}

/**
 * Walk the tree upwards until a potential listener is found.
 * @param {Event} e
 * @param {HTMLElement} elm
 * @param {boolean} prod
 */
function onclick(e, elm, prod) {
	elm
		? elm.dataset.command
			? trigger(e, elm, prod)
			: onclick(e, elm.parentElement, prod)
		: void false;
}

/**
 * @param {Event} e
 * @param {HTMLElement} elm
 * @param {boolean} prod
 * @param {DOMStringMap} dataset
 */
function trigger(e, elm, prod) {
	ascend(elm, freeze(new Command(elm, e), prod));
}

/**
 * Dispatch {Command} upwards.
 * @param {HTMLElement} elm
 * @param {Command} command
 */
function ascend(elm, command) {
	elm && trycommand(elm, command);
	elm && ascend(elm.parentElement, command);
}

/**
 * Check for secret method and run it to potentially match
 * the {Command} with the element (see function `testcommand`).
 * @param {SpiritElement} elm
 * @param {Command} command
 */
function trycommand(elm, command) {
	!command.consumed && elm[oncommand] && elm[oncommand](command);
}

/**
 * Freeze the thing in devmode. Note that this
 * will not freeze the command value (payload).
 * @param {Command} command
 * @param {boolean} prod
 * @returns {Command}
 */
function freeze(command, prod) {
	return prod ? command : Object.freeze(command);
}

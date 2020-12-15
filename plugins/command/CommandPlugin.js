import { MapSet } from '@gui/data-utils';
import { Command } from './Command';

/**
 * Working with attributes.
 * @param {SpiritElement|HTMLElement|ShadowRoot} elm
 * @returns {CommandPlugin}
 */
export default function CommandPlugin(elm, prod) {
	const map = new MapSet();
	const key = Symbol('oncommand'); // TODO: Refactor this thing out of here!
	const plugin = {
		/**
		 * Add command listener(s).
		 * @param {string|Array<string>} types
		 * @param {Function} cb
		 * @returns {this}
		 */
		on(types, cb) {
			each(types, (type) => map.add(type, cb));
			if (!elm[key]) {
				elm[key] = testcommand(map);
				setup(elm, key, prod);
			}
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
			map.size === 0 && delete elm[key];
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
			delete elm[key];
			map.clear();
		},

		/**
		 * Working with exotic nodes.
		 * @param {HTMLElement|ShadowRoot} node
		 * @returns {CommandPlugin}
		 */
		wrap(node) {
			return CommandPlugin(node, prod);
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

// Setup .......................................................................

/**
 * TODO: Form field specials `oninput`, `onchange`, `paste` etc.
 * Checkboxes should trigger boolean or string values (if value).
 * @param {SpiritElement|ShadowRoot} node
 * @param {Symbol} key
 * @param {boolean} prod
 */
function setup(node, key, prod) {
	node.addEventListener('click', (e) => {
		onclick(e, e.target, key, prod);
	});
}

/**
 * Walk the tree upwards until a potential listener is found.
 * @param {Event} e
 * @param {HTMLElement} elm
 * @param {boolean} prod
 */
function onclick(e, elm, key, prod) {
	elm
		? elm.dataset.command
			? trigger(e, elm, key, prod)
			: onclick(e, elm.parentElement, key, prod)
		: void false;
}

// Evaluating ..................................................................

/**
 * Generate the secret `[key]` method.
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

// TODO: This ascending crawling of the DOM should not be needed no more!

/**
 * @param {Event} e
 * @param {HTMLElement} elm
 * @param {Symbol} key
 * @param {boolean} prod
 * @param {DOMStringMap} dataset
 */
function trigger(e, elm, key, prod) {
	ascend(elm, key, freeze(new Command(elm, e), prod));
}

/**
 * Dispatch {Command} upwards.
 * @param {HTMLElement|ShadowRoot} elm
 * @param {Symbol} key
 * @param {Command} command
 */
function ascend(elm, key, command) {
	elm && trycommand(elm, key, command);
	elm && ascend(elm.parentNode, key, command);
}

/**
 * Check for secret method and run it to potentially match
 * the {Command} with the element (see function `testcommand`).
 * @param {SpiritElement} elm
 * @param {Symbol} key
 * @param {Command} command
 */
function trycommand(elm, key, command) {
	!command.consumed && elm[key] && elm[key](command);
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

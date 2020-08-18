import { MapSet } from '@utils/data-utils';

/**
 * Stamp the secret method.
 * @type {Symbol}
 */
const oncommand = Symbol('oncommand');

/**
 * Tracking the DOM event so we can `preventDefault` it.
 * @type {Symbol}
 */
const realevent = Symbol('realevent');

/**
 * Tracking consumed Commands (not as a property on
 * the Command since we'll freeze that in devmode).
 * @type {WeakSet<Action>}
 */
const consumed = new WeakSet();

/**
 * Action.
 */
class Command {
	/**
	 * Support recursive destructuring.
	 * @type {Action}
	 */
	command = this;

	/**
	 * Although conventionally named target,
	 * this property pins the command source.
	 * @type {SpiritElement}
	 */
	target = null;

	/**
	 * Action type.
	 * @type {string}
	 */
	type = null;

	/**
	 * Optional command value.
	 * @type {?}
	 */
	value = null;

	/**
	 * The {ClickEvent} or whatever in case we'd 
	 * like to `preventDefault` it or something.
	 * @type {Event}
	 */
	[realevent] = null;

	/**
	 * Initialize that command.
	 * @param {HTMLElement} target
	 * @param {Event} e
	 * @param {DOMStringMap} data
	 */
	constructor(elm, e, data = elm.dataset) {
		Object.assign(this, {
			value: cast(data.value ?? elm.value ?? null),
			name: elm.name ?? null,
			type: data.command,
			target: elm,
			[realevent]: e
		});
	}

	/**
	 * Consume the dispatched command to prevent further processing.
	 * This will also block and inhibit the internally set DOM event.
	 * TODO: How to handle the event in case this was deferred a tick.
	 * @returns {Command}
	 */
	consume() {
		this[realevent].stopPropagation();
		this[realevent].preventDefault();
		consumed.add(this);
		return this;
	}
}

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
 * Run callbacks for Action.
 * @param {Action} command
 * @param {Array<Function>} cbs
 */
function runcommand(command, cbs) {
	cbs.every((cb) => {
		cb(command);
		return !consumed.has(command);
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
 * Dispatch {Command} upwards
 * @param {HTMLElement} elm
 * @param {Action} action
 */
function ascend(elm, command) {
	elm && trycommand(elm, command);
	elm && ascend(elm.parentElement, command);
}

/**
 * Check for secret method and run it to potentially match
 * the {Command} with the element (see function `testcommand`).
 * @param {SpiritElement} elm
 * @param {Action} command
 */
function trycommand(elm, command) {
	!consumed.has(command) && elm[oncommand] && elm[oncommand](command);
}

/**
 * Freeze the thing in devmode. Note that this
 * will not freeze the command value (payload).
 * @param {Action} command
 * @param {boolean} prod
 * @returns {Action}
 */
function freeze(command, prod) {
	return prod ? command : Object.freeze(command);
}

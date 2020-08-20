/**
 * Tracking consumed Commands (not as a property on
 * the Command since we'll freeze that in devmode).
 * @type {WeakSet<Command>}
 */
const consumed = new WeakSet();

/**
 * Tracking the DOM event so we can `preventDefault` it.
 * @type {Symbol}
 */
const event = Symbol('event');

/**
 * Command.
 */
export class Command {
	/**
	 * Support recursive destructuring.
	 * @type {Command}
	 */
	command = this;

	/**
	 * Although conventionally named target,
	 * this property pins the command source.
	 * @type {SpiritElement}
	 */
	target = null;

	/**
	 * Command type.
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
	[event] = null;

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
			[event]: e
		});
	}

	/**
	 * Consume the dispatched command to prevent further processing.
	 * This will also block and inhibit the internally set DOM event.
	 * @returns {Command}
	 */
	consume() {
		try {
			this[event].stopPropagation();
			this[event].preventDefault();
		} catch {
			// TODO: confirm that we'd need this try catch if deferred (timeout)
		}
		consumed.add(this);
		return this;
	}

	/**
	 * Command consumed?
	 * @type {boolean}
	 */
	get consumed() {
		return consumed.has(this);
	}
}
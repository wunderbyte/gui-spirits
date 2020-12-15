import { cast } from '@gui/data-utils';

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
	 * Although conventionally named `target`, this property pins
	 * the DOM element *source* that triggered this command.
	 * @type {HTMLElement}
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
			value: evaluate(elm, data),
			href: elm.href ?? null,
			name: elm.name ?? null,
			type: data.command,
			target: elm,
			[event]: e,
		});
	}

	/**
	 * Consume the dispatched command to prevent further processing.
	 * This will also block and inhibit the internally set DOM event.
	 * TODO: Handle defered call scenario (consumed on setTimeout etc).
	 * @returns {Command}
	 */
	consume() {
		this[event].stopPropagation();
		this[event].preventDefault();
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

/**
 * @param {HTMLElement} elm
 * @param {DOMStringMap} data
 * @returns {string|boolean|null}
 */
function evaluate(elm, data) {
	switch (elm.type) {
		case 'checkbox':
			return elm.checked; // TODO: other things!
		default:
			return cast(data.value ?? elm.value ?? null);
	}
}

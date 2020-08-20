/**
 * Tracking consumed Actions (not as a property on
 * the Action since we'll freeze that in devmode).
 * @type {WeakSet<Action>}
 */
const consumed = new WeakSet();

/**
 * Action.
 */
export class Action {
	/**
	 * Support recursive destructuring.
	 * @type {Action}
	 */
	action = this;

	/**
	 * Although conventionally named target,
	 * this property pins the action source.
	 * @type {SpiritElement}
	 */
	target = null;

	/**
	 * Action type.
	 * @type {string}
	 */
	type = null;

	/**
	 * Optional data (payload).
	 * @type {?}
	 */
	data = null;

	/**
	 * Initialize that action.
	 * @param {SpiritElement} target
	 * @param {string} type
	 * @param {?} data
	 */
	constructor(target, type, data) {
		Object.assign(this, {
			target,
			type,
			data,
		});
	}

	/**
	 * Consume the action (to prevent further processing).
	 * @returns {Action}
	 */
	consume() {
		consumed.add(this);
		return this;
	}

	/**
	 * Action consumed?
	 * @type {boolean}
	 */
	get consumed() {
		return consumed.has(this);
	}
}

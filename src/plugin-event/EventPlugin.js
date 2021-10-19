/**
 * Working with events.
 * @param {CustomElement} elm
 * @returns {EventPlugin}
 */
export default function EventPlugin(elm) {
	/**
	 * Tracking added listeners (not caring if they are removed).
	 * @type {Set<Function|Object>}
	 */
	const active = new Set();
	const plugin = {
		/**
		 * Add listener.
		 * @param {string|Array<string>} types
		 * @param {Node|Window} target
		 * @param {Function|Object} handler
		 * @param {boolean|Object} capture
		 * @returns {this}
		 */
		on(types, target = elm, handler = elm, capture = false) {
			each(types, (type) => active.add(on(target, type, handler, capture)));
			return plugin;
		},

		/**
		 * Remove listener.
		 * @param {string|Array<string>} types
		 * @param {Node|Window} target
		 * @param {Function|Object} handler
		 * @param {boolean|Object} capture
		 * @returns {this}
		 */
		off(types, target = elm, handler = elm, capture = false) {
			each(types, (type) => off(target, type, handler, capture));
			return plugin;
		},

		/**
		 * Add listener that removes itself once the event has occured.
		 * @param {string|Array<string>} types
		 * @param {Node|Window} target
		 * @param {Function|Object} handler
		 * @param {boolean|Object} capture
		 * @returns {this}
		 */
		once(types, target = elm, handler = elm, capture = false) {
			each(types, (type) => once(target, type, handler, capture));
			return plugin;
		},

		/**
		 * Add or remove listener depending on value of the first truthy argument.
		 * @param {truthy} on
		 * @param {string|Array<string>} types
		 * @param {Node|Window} target
		 * @param {Function|Object} handler
		 * @param {boolean|Object} capture
		 * @returns {this}
		 */
		shift(on, ...args) {
			return !!on ? plugin.on(...args) : plugin.off(...args);
		},

		/**
		 * Conveniently shortcut click handler on the {CustomElement}.
		 * @param {Function|SpiritElement} handler
		 * @param {boolean} [capture]
		 */
		onclick(handler = elm, capture = false) {
			return plugin.on('click', elm, handler, capture);
		},

		/**
		 * Conveniently unregister shortcut click handler.
		 * @param {Function|SpiritElement} handler
		 * @param {boolean} [capture]
		 */
		offclick(handler = elm, capture = false) {
			return plugin.off('click', elm, handler, capture);
		},

		/**
		 * Dispatch `customEvent` with optional `detail`.
		 * @param {string} type
		 * @param {*} [detail]
		 * @param {boolean} [bubbles]
		 * @returns {this}
		 */
		dispatch(type, detail, bubbles = false) {
			elm.dispatchEvent(new CustomEvent(type, { detail, bubbles }));
			return plugin;
		},

		/**
		 * Dispatch bubbling `customEvent`.
		 * @param {string} type
		 * @param {*} [detail]
		 * @returns {this}
		 */
		bubble(type, detail) {
			return plugin.dispatch(type, detail, true);
		},

		/**
		 * Remove all registered listeners.
		 */
		onexorcise() {
			active.forEach((off) => off());
		},
	};
	return plugin;
}

// Scoped ......................................................................

/**
 * Always iterate as array even if not.
 * Splits spaces into multiple entries.
 * TODO: Split all types of whitespaces
 * @param {string|Array<string>} types
 * @param {Function} action
 */
function each(types, action) {
	[].concat(types.split ? types.split(' ') : types).forEach(action);
}

/**
 * Add event listener.
 * @param {Node|Window} target
 * @param {...*} args
 * @returns {Function} Call plugin to remove event listener
 */
function on(target, ...args) {
	target.addEventListener(...args);
	return () => off(target, ...args);
}

/**
 * Remove event listener.
 * @param {Node|Window} target
 * @param {...*} args
 */
function off(target, ...args) {
	target.removeEventListener(...args);
}

/**
 * Add self-removing listener.
 * @param {Node|Window} target
 * @param {string} type
 * @param {Function} action
 * @param {Object|boolean} config
 */
function once(target, type, action, config) {
	const reset = on(
		target,
		type,
		(e) => {
			action && action(e);
			reset();
		},
		config
	);
}

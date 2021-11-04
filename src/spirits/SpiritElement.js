import { Spirit, detach, attach, exorcise } from './Spirit';
import { expand } from './SpiritInterface';

/**
 * Generic custom element constructor factory.
 * @param {Function} controller
 * @param {Map<string, Function>} plugins
 * @param {boolean} prod
 */
export default function (controller, plugins, prod) {
	return class SpiritElement extends HTMLElement {
		#spirit = null;
		#moved = false;
		constructor() {
			super();
			this.#spirit = Spirit(this, plugins, prod);
		}
		connectedCallback() {
			if (this.#spirit) {
				this.#moved
					? this.#spirit[attach]()
					: expand(this, controller(this.#spirit) || {}, prod);
			}
		}
		disconnectedCallback() {
			if (this.#spirit) {
				this.#moved = true;
				this.#spirit[detach]();
				didexit(this).then((exit) => {
					if (exit) {
						this.#spirit[exorcise]();
						this.#spirit = null;
					}
				});
			}
		}
	};
}

// Scoped ......................................................................

/**
 * Element removed from DOM?
 * TODO: Does this work in Shadow DOM?
 * TODO: Multiple elms disconnected should not all queue a timeout!
 * @param {CustomElement} elm
 * @returns {Promise<boolean>}
 */
function didexit(elm) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(!document.contains(elm));
		});
	});
}

import SpiritElement from './SpiritElement';

/**
 * TODO: In dev mode, warn when attempting to
 * register same tag with non-same controller.
 * @param {string} tag
 * @param {Function} controller
 * @param {Map<string, Function>} [plugins]
 * @param {boolean} [prod]
 * @returns {SpiritElement}
 */
export function summon(tag, controller, plugins = new Map(), prod = false) {
	customElements.define(tag, SpiritElement(controller, plugins, prod));
}

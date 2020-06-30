import SpiritElement from './SpiritElement';
export { html, render } from 'lit-html';
export { unsafeHTML as unsafe } from 'lit-html/directives/unsafe-html.js';
export { ifDefined as attif } from 'lit-html/directives/if-defined'; // TODO: reimplement
export { css } from 'lit-css';
export * from '@gui/plugins';

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

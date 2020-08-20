import { common, render, html } from '@gui/plugin-dom';
export { css } from 'lit-css';

/**
 * Working with the Shadow DOM.
 * Borrows from the normal DOM.
 * @param {SpiritElement} elm
 * @param {undefined} [plugin]
 * @returns {ShadowPlugin}
 */
export default function ShadowPlugin(elm) {
	const shadow = elm.ShadowRoot || elm.attachShadow({ mode: 'open' });
	const plugin = {};
	const sheets = [];
	const parser = (template) => html`
		<style>
			${shadow.adoptedStyleSheets ? '' : sheets.join('')}
		</style>
		${template}
	`;
	return Object.assign(
		plugin,
		common(shadow, plugin),
		render(shadow, plugin, parser),
		extras(shadow, plugin, sheets)
	);
}

/**
 * Shadow DOM bonus methods.
 * @param {ShadowRoot} shadow
 * @param {undefined} [plugin]
 * @returns {Object}
 */
function extras(shadow, plugin, sheets) {
	return {
		/**
		 * TODO: Support multiple.
		 * TODO: Abandon sheet.
		 * @param {CSSResult} sheet
		 * @returns {this}
		 */
		adopt(sheet) {
			adopt(shadow, sheet);
			sheets.push(sheet);
			return plugin;
		},
	};
}

/**
 * Adopt natively if supported.
 * @param {ShadowRoot} shadow
 * @param {CSSResult} sheet
 */
function adopt(shadow, sheet) {
	if (shadow.adoptedStyleSheets) {
		shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, real(sheet)];
	}
}

/**
 * Create real `StyleSheet` from `CSSResult`.
 * @param {CSSResult} sheet
 * @returns {StyleSheet}
 */
function real(sheet) {
	const cache = real.cache || (real.cache = new Map());
	if (!cache.has(sheet)) {
		const css = new CSSStyleSheet();
		css.replaceSync(String(sheet));
		cache.set(sheet, css);
	}
	return cache.get(sheet);
}

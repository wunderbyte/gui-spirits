/**
 * Working with position and dimension.
 * TODO: Interface that accounts for scrolling (and what is scrolling!)
 * @param {CustomElement} elm
 * @returns {BoxPlugin}
 */
export default function BoxPlugin(elm) {
	const box = () => elm.getBoundingClientRect();
	return {
		/**
		 * Raw bounding box.
		 * @type {DOMRect}
		 */
		get rect() {
			return box();
		},

		/**
		 * Horizontal position.
		 * @type {number}
		 */
		get x() {
			return box().x;
		},

		/**
		 * Vertical position.
		 * @type {number}
		 */
		get y() {
			return box().y;
		},

		/**
		 * Element width.
		 * @type {number}
		 */
		get width() {
			return box().width;
		},

		/**
		 * Element height.
		 * @type {number}
		 */
		get height() {
			return box().height;
		},
	};
}

/**
 * Working with position and dimension.
 * @param {SpiritElement} elm
 * @returns {BoxPlugin}
 */
export function BoxPlugin(elm) {
	const box = () => elm.getBoundingClientRect();
	return {
		get rect() {
			return box();
		},
		get x() {
			return box().x;
		},
		get y() {
			return box().y;
		},
		get width() {
			return box().width;
		},
		get height() {
			return box().height;
		},
	};
}

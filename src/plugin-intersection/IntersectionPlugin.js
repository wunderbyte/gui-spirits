/**
 * Observe element for intersection with scrolling ancestor boundaries.
 * Supports limited configurability for ease of use, consider using some
 * out of the box {IntersectionObserver} for advanced visibility tracking.
 * TODO: Either deprecate the threshold argument OR make sure to cleanup!
 * @param {HTMLElement|ShadowRoot} elm
 * @returns {IntersectionPlugin}
 */
export default function IntersectionPlugin(elm) {
	/**
	 * Register intersection callback. Returns a function to unregister.
	 * @param {Function} cb
	 * @param {WeakMap} map
	 * @returns {Function}
	 */
	function add(cb, threshold, map) {
		setup(elm, cb, map);
		getObserver(threshold).observe(elm);
		return () => del(cb, map);
	}

	/**
	 * Unregister intersection callback.
	 * @param {Function} cb
	 * @param {WeakMap} map
	 * @param {Set<Function>} [set]
	 */
	function del(cb, threshold, map, set = map.get(elm)) {
		set.delete(cb);
		if (set.size === 0) {
			getObserver(threshold).unobserve(elm);
			map.delete(elm);
		}
	}

	return {
		/**
		 * Run callback whenever visible.
		 * Returns function to stop this.
		 * @param {Function} cb
		 * @param {number} [th]
		 * @returns {Function}
		 */
		onvisible(cb, th = 0) {
			return add(cb, th, onvisibles);
		},

		/**
		 * Run callback only once when visible.
		 * Returns function to forget about it.
		 * @param {Function} cb
		 * @param {number} [th]
		 * @returns {Function}
		 */
		oncevisible(cb, th = 0) {
			return this.onvisible(function wrap() {
				del(wrap, th, onvisibles);
				cb();
			}, th);
		},

		/**
		 * Run callback whenever not visible.
		 * Returns function to abandon this.
		 * @param {Function} cb
		 * @param {number} [th]
		 * @returns {Function}
		 */
		oninvisible(cb, th = 0) {
			return add(cb, th, oninvisibles);
		},

		/**
		 * Run callback only once when hidden.
		 * Returns function to forget about it.
		 * @param {Function} cb
		 * @param {number} [th]
		 * @returns {Function}
		 */
		onceinvisible(cb, th = 0) {
			return this.oninvisible(function wrap() {
				del(wrap, th, oninvisibles);
				cb();
			}, th);
		},

		/**
		 * TODO: Cleanup each individual th used!!!
		 */
		cleanup() {
			onvisibles.delete(elm);
			oninvisibles.delete(elm);
			getObserver().unobserve(elm);
		},
	};
}

// Scoped ......................................................................

const observers = new Map();
const onvisibles = new WeakMap();
const oninvisibles = new WeakMap();
const isvisible = (entry) => entry.isIntersecting;
const isinvisible = (entry) => !isvisible(entry);
const lookupelm = (entry) => [entry.target, entry];
const hasvisible = ([elm]) => !!onvisibles.has(elm);
const hasinvisible = ([elm]) => !!oninvisibles.has(elm);
const govisible = ([elm, entry]) =>
	void onvisibles.get(elm).forEach((cb) => cb(entry));
const goinvisible = ([elm, entry]) =>
	void oninvisibles.get(elm).forEach((cb) => cb(entry));

/**
 *
 * @param {HTMLElement} elm
 * @param {Function} cb
 * @param {Map<HTMLElement, Set>} map
 */
function setup(elm, cb, map) {
	!map.has(elm) && map.set(elm, new Set());
	map.get(elm).add(cb);
}

/**
 * @param {Array<IntersectionObserverEntry>} entries
 */
function intersect(entries) {
	entries
		.filter(isvisible)
		.map(lookupelm)
		.filter(hasvisible)
		.forEach(govisible);
	entries
		.filter(isinvisible)
		.map(lookupelm)
		.filter(hasinvisible)
		.forEach(goinvisible);
}

/**
 * Get observer for given margin.
 * @param {number|Array<number>} threshold
 * @returns {IntersectionObserver}
 */
function getObserver(threshold = 0) {
	const key = JSON.stringify(threshold);
	!observers.has(key) &&
		observers.set(
			key,
			new IntersectionObserver(intersect, {
				threshold,
			})
		);
	return observers.get(key);
}

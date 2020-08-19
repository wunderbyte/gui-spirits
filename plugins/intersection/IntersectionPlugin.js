/**
 * Observe element for intersection with scrolling ancestor boundaries.
 * @param {HTMLElement|ShadowRoot} elm
 * @returns {IntersectionPlugin}
 */
export function IntersectionPlugin(elm) {
	/**
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
	 * @param {Function} cb
	 * @param {WeakMap} map
	 * @param {Set<Function>} [set]
	 * @returns {Function}
	 */
	function del(cb, threshold, map, set = map.get(elm)) {
		set.delete(cb);
		if (set.size === 0) {
			getObserver(threshold).unobserve(elm);
			map.delete(elm);
		}
	}

	return {
		onvisible(cb, th = 0) {
			return add(cb, th, onvisibles);
		},

		oncevisible(cb, th = 0) {
			return this.onvisible(function wrap() {
				del(wrap, th, onvisibles);
				cb();
			}, th);
		},

		oninvisible(cb, th = 0) {
			return add(cb, th, oninvisibles);
		},

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

const exist = set => !!set;
const clear = set => set.clear();

/**
 * Add callback to set and return function to delete from set.
 * @param {Function} cb
 * @param {Set<Function>} set
 * @returns {Function}
 */
export function addCallback(cb, set) {
	set.add(cb);
	return () => set.delete(cb);
}

/**
 * Run callbacks in set with given arguments.
 * @param {Set<Function>|undefined} set
 * @param {...*} args
 */
export function runCallbacks(set, ...args) {
	set && set.forEach(cb => cb(...args));
}

/**
 * Clear set(s) of callbacks.
 * @param  {...Set} sets 
 */
export function nonCallbacks(...sets) {
	sets.filter(exist).forEach(clear);
}
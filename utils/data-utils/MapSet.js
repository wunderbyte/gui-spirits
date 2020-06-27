/**
 * Some kind of {Map} with string keys and {Set} values
 * TODO: Remove any unused methods at some point in time
 */
export class MapSet {
	/*
	 * @type {Map<string, Set<*>>}
	 */
	#map = new Map();

	/**
	 * Map size.
	 * @type {number}
	 */
	get size() {
		return this.#map.size;
	}

	/**
	 * Push entry to set indexed by key.
	 * TODO: Validate that `key` is a string
	 * @param {string} key
	 * @param {*} value
	 * @returns {this}
	 */
	add(key, value) {
		ok(key, value);
		const map = this.#map;
		!map.has(key) && map.set(key, new Set());
		map.get(key).add(value);
		return this;
	}

	/**
	 * Remove entry from set indexed by key.
	 * TODO: Rename `delete`
	 * TODO: Validate that `key` is a string
	 * TODO: Validate that `value` is provided
	 * @param {string} key
	 * @param {*} value
	 * @returns {this}
	 */
	del(key, value) {
		ok(key, value);
		let map = this.#map;
		let set = map.get(key);
		if (set && set.has(value)) {
			set.delete(value);
			if (set.size === 0) {
				map.delete(key);
			}
		}
		return this;
	}

	/**
	 * @param {string} key
	 * @param {*} [value]
	 * @returns {boolean}
	 */
	has(key, value) {
		const map = this.#map;
		const one = arguments.length === 1;
		return map.has(key) && (one || map.get(key).has(value));
	}

	/**
	 * Get set indexed by key. Returns a copy.
	 * @param {string} key
	 * @returns {Set<*>|undefined}
	 */
	get(key) {
		return this.has(key) ? new Set(this.#map.get(key)) : undefined;
	}

	/**
	 * Clear the map.
	 * @returns {this}
	 */
	clear() {
		this.#map.clear();
		return this;
	}

	/**
	 * Iterate map.
	 * @param  {Function} cb
	 */
	forEach(cb) {
		this.#map.forEach(cb);
	}

	/**
	 * Get the map (returns a copy!)
	 * @returns {Map<string, Set<*>>}
	 */
	toMap() {
		return new Map(this.#map);
	}

	/**
	 * Get the set indexed by key. Returns a copy. Always returns a Set.
	 * @param {string} key
	 * @returns {Set<*>}
	 */
	toSet(key) {
		return this.has(key) ? new Set(this.#map.get(key)) : new Set();
	}

	/**
	 * Get the set indexed by key as array. Always returns an array.
	 * @param {string} key
	 * @returns {Array}
	 */
	toArray(key) {
		return [...this.toSet(key)];
	}
}

/**
 * Input OK?
 * @param {*} key
 * @param {*} val
 */
function ok(key, val) {
	key === undefined && error(`key may not be undefined`);
	val === undefined && error(`value may not be undefined (${key})`);
}

/**
 * Not OK.
 * @throws {TypeError}
 * @param {string} message
 */
function error(message) {
	throw new TypeError(`MapSet ${message}`);
}

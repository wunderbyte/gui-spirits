/**
 * Working with classnames.
 * TODO: Support arrays and space-separated strings in all methods!
 * @param {SpiritElement} elm
 * @returns {CSSPlugin}
 */
export function CSSPlugin(elm) {
	const cache = CSSCache(elm);
	const plugin = {
		/**
		 * Add classes.
		 * @param  {...string} names
		 * @returns {this} 
		 */
		add(...names) {
			cache.add(...names);
			return plugin;
		},

		/**
		 * Remove classes (via the semantics of a {Set}).
		 * @param  {...string} names 
		 * @returns {this} 
		 */
		delete(...names) {
			cache.delete(...names);
			return plugin;
		},

		/**
		 * Remove classes shorthand.
		 * @param  {...string} names
		 * @returns {this}  
		 */
		del(...names) {
			return plugin.delete(...names);
		},

		/**
		 * Has classes?
		 * @param  {...string} names
		 * @returns {this}  
		 */
		has(...names) {
			return names.every((name) => elm.classList.contains(name));
		},

		/**
		 * Toggle single class.
		 * @param {string} name 
		 * @param {truthy} on
		 * @returns {this}  
		 */
		toggle(name, on) {
			cache.toggle(name, on);
			return plugin;
		},

		/**
		 * Toggle multiple classes.
		 * @param {truthy} on 
		 * @param  {...any} names
		 * @returns {this}  
		 */
		shift(on, ...names) {
			names.forEach((name) => this.toggle(name, on));
			return plugin;
		},

		/**
		 * Set CSS variable.
		 * @param {string} name 
		 * @param {string} value 
		 * @param {Element} target
		 * @returns {this}  
		 */
		setProperty(name, value, target) {
			(target ? target.style : elm.style).setProperty(name, value);
			return plugin;
		},

		/**
		 * Get CSS variable.
		 * @param {string} name 
		 * @param {Element} target
		 * @returns {this}  
		 */
		getProperty(name, target) {
			return getComputedStyle(target || elm).getPropertyValue(name);
		},

		/**
		 * Get or destructively set the entire classname.
		 * TODO: when setting, persist assigned classes in cache!
		 * @param {string} name 
		 * @returns {this} 
		 */
		name(name) {
			return arguments.length ? void (elm.className = name) : elm.className;
		},

		/**
		 * Use this API to work with classes for arbitrary element.
		 * @param {Element} newelm
		 * @returns {CSSPlugin}
		 */
		wrap(newelm) {
			return CSSPlugin(newelm);
		},
	};
	return plugin;
}

// Scoped ......................................................................

// secret method to restore classes from cache
const restorecache = Symbol('restorecache');

/**
 * Manage classnames while ensuring that frameworks cannot remove them.
 * @param {SpiritElement} elm
 */
function CSSCache(elm) {
	const set = new Set();
	const add = (name) => set.add(name);
	const del = (name) => set.delete(name);
	const css = elm.classList;
	elm[restorecache] = () => {
		set.forEach((name) => !css.contains(name) && css.add(name));
	};
	return {
		add(...names) {
			names.forEach(add);
			css.add(...names);
		},
		delete(...names) {
			names.forEach(del);
			css.remove(...names);
		},
		toggle(name, on) {
			arguments.length == 1 ? css.toggle(name) : css.toggle(name, !!on);
			css.contains(name) ? add(name) : del(name);
		},
		has(name) {
			return set.has(name);
		},
	};
}

// simply observe all classname changes and restore what was lost
const isclass = (record) => record.attributeName === 'class';
const restore = (record) => record.target[restorecache]?.();
const persist = (records) => records.filter(isclass).forEach(restore);
new MutationObserver(persist).observe(document, {
	attributes: true,
	subtree: true,
});

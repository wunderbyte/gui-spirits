/**
 * Working with classnames.
 * @param {SpiritElement} elm
 * @returns {CSSPlugin}
 */
export function CSSPlugin(elm) {
	const cache = CSSCache(elm);
	const plugin = {
		add(...names) {
			cache.add(...names);
			return plugin;
		},
		delete(...names) {
			cache.delete(...names);
			return plugin;
		},
		del(...names) {
			return plugin.delete(...names);
		},
		has(...names) {
			return names.every((name) => elm.classList.contains(name));
		},
		toggle(name, on) {
			cache.toggle(...arguments);
			return plugin;
		},
		shift(on, ...names) {
			names.forEach((name) => this.toggle(name, on));
			return plugin;
		},
		setProperty(name, value, target) {
			(target ? target.style : elm.style).setProperty(name, value);
			return plugin;
		},
		getProperty(name, target) {
			return getComputedStyle(target || elm).getPropertyValue(name);
		},
		name(name) {
			/* TODO: when setting, persist assigned classes in cache */
			return arguments.length ? void (elm.className = name) : elm.className;
		},
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

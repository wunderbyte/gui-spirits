import { frozen } from './SpiritUtils';

const canexorcise = (plugin) => !!plugin.onexorcise;
const runexorcise = (plugin) => plugin.onexorcise();

/**
 * Building accessors for lazy intantiation of spirit plugins.
 * @param {SpiritElement} element
 * @param {Array<Object>} accessed
 * @param {Map<string, Function>} plugins
 * @param {boolean} prod
 * @returns {Object}
 */
export function plugin(element, accessed, plugins, prod) {
	return Object.fromEntries(
		[...plugins.entries()].map(accessor(element, accessed, prod))
	);
}

/**
 * Invoke the `onexorcise` method on any instantiated plugins that define it.
 * @param {Array<Object>} accessed
 */
export function unplug(accessed) {
	accessed.filter(canexorcise).forEach(runexorcise);
}

// Scoped ......................................................................

/**
 * Build function to declare plugin accessor.
 * @param {SpiritElement} element
 * @param {Array<Object>} accessed
 * @param {boolean} prod
 * @returns {Function}
 */
function accessor(element, accessed, prod) {
	return ([key, Plugin]) => {
		let p;
		return [
			key,
			{
				get: () => (p = p || access(Plugin, element, accessed, prod)),
				configurable: prod,
				enumerable: false,
			},
		];
	};
}

/**
 * Invoke plugin factory function and cache the returned the plugin instance.
 * @param {Function} plugin
 * @param {SpiritElement} element
 * @param {Array<Object>} accessed
 * @param {boolean} prod
 * @returns {Object}
 */
function access(Plugin, element, accessed, prod) {
	const plugin = frozen(Plugin(element, prod), prod);
	return typeof plugin === 'object'
		? accessed[accessed.push(plugin) - 1]
		: plugin;
}

/**
 * Define on the element all methods, properties and accessors
 * from the interface (potentially) returned by the controller.
 * @param {SpiritElement} elm
 * @param {Object} expandos
 * @param {boolean} prod
 */
export function expand(elm, expandos, prod) {
	const descs = Object.getOwnPropertyDescriptors(expandos);
	const props = index(descs, elm);
	remove(props, elm);
	define(descs, elm, prod);
	assign(props, elm);
}

// Scoped ......................................................................

/**
 * Index all properties with an corresponding setter that
 * may have been assigned before the controller executed.
 * TODO: Handle value descriptors!
 * @param {Array<Object>} descs
 * @param {SpiritElement} elm
 * @returns {Array<string, *>}
 */
function index(descs, elm) {
	return Object.entries(descs)
		.filter(([, desc]) => !!desc.set)
		.filter(([key]) => elm.hasOwnProperty(key))
		.map(([key, desc]) => [key, elm[key], desc]);
}

/**
 * Remove traces of indexed properties.
 * @param {Array<string, *>} props
 * @param {SpiritElement} elm
 */
function remove(props, elm) {
	props.forEach(([key]) => {
		delete elm[key];
	});
}

/**
 * Transfer descriptors to element.
 * @param {Array<Object>} descs
 * @param {SpiritElement} elm
 * @param {boolean} prod
 */
function define(descs, elm, prod) {
	Object.entries(descs).forEach(([key, desc]) => {
		Reflect.defineProperty(
			elm,
			key,
			Object.assign(desc, {
				configurable: prod,
				enumerable: false,
			})
		);
	});
}

/**
 * Run setters with indexed values.
 * TODO: Handle value descriptors!
 * @param {Array<string, *>} props
 * @param {SpiritElement} elm
 */
function assign(props, elm) {
	props.forEach(([, val, desc]) => {
		desc.set.call(elm, val);
	});
}

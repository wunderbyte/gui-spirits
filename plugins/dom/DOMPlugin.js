import { addCallback, runCallbacks } from '@gui/callback-utils';
import { render as litrender } from 'lit-html';
export { render as litrender, html } from 'lit-html';
export { unsafeHTML as unsafe } from 'lit-html/directives/unsafe-html.js';
export { ifDefined as attif } from 'lit-html/directives/if-defined'; // TODO: reimplement

let [set1, set2] = [new Set(), new Set()];

/* TODO: QUERY METHODS TO IMPLEMENT!
	parent(type); // parent element or spirit of type
	child(type); // first child element (or spirit)
	children(type); // all children
	ancestor(type); // first ancestor
	ancestors(type); // all ancestors
	descendant(type); // first descendant
	descendants(type); // all descendants
	next(type); // next sibiling (of type)
	previous(type); // previous sibling
	following(type); // all following siblings
	preceding(type); // all preceding siblings
	first(type); // first child (or spirit of type)
	last(type); // last child (or spirit of type)
*/

/*
	TODO: MUTATION METHODS TO IMPLEMENT
	append(things); // append element(s) or spirit(s)
	prepend(things); // prepend thing(s)
	before(things); // insert thing(s) before
	after(things); // insert things(s) after
	replace(things); // replace with thing(s)
*/

/**
 * Working with the light DOM.
 * @param {SpiritElement} context
 * @returns {DOMPlugin}
 */
export default function DOMPlugin(context) {
	const plugin = {};
	return Object.assign(
		plugin,
		common(context, plugin),
		normal(context, plugin),
		render(context, plugin),
		extras(plugin)
	);
}

/**
 * Add global prerender callback.
 * @param {Function} cb
 * @returns {Function} Returns a function to remove the callback.
 */
export function onprerender(cb) {
	return addCallback(cb, set1);
}

/**
 * Add global postrender callback.
 * TODO: rename `onrender`
 * @param {Function} cb
 * @param {Set} set
 * @returns {Function} Returns a function to remove the callback.
 */
export function onpostrender(cb) {
	return addCallback(cb, set2);
}

/**
 * Working with both light and Shadow DOM.
 * @param {SpiritElement|ShadowRoot} context
 * @param {Object} plugin
 * @returns {Object}
 */
export function common(context, plugin) {
	return {
		/**
		 * The element or the shadowRoot.
		 * @type {HTMLElement|ShadowRoot}
		 */
		get root() {
			return context;
		},

		/**
		 * @param {string} selector
		 * @param {Function} [calllback]
		 * @returns {HTMLElement}
		 */
		q(selector, callback) {
			return q(context, selector, callback);
		},

		/**
		 * @param {string} selector
		 * @param {Function} [callback]
		 * @returns {Array<HTMLElement>}
		 */
		qall(selector, callback) {
			return qall(context, selector, callback);
		},

		/**
		 * TODO: Support selector to match
		 * @returns {Array<HTMLElement>}
		 */
		children() {
			return Array.from(context.children);
		},

		/**
		 * @param {Node|string} arg
		 * @returns {boolean}
		 */
		contains(arg) {
			return typeof arg === 'string'
				? !!q(context, arg)
				: context.contains(arg);
		},

		/**
		 * Empty context or given node.
		 * @param {Node|DocumentFragment} node
		 * @returns {this}
		 */
		empty(node = context) {
			while (node.hasChildNodes()) {
				node.removeChild(node.lastChild);
			}
			return plugin;
		},

		/**
		 * Append node(s) and return the node.
		 * @param {Node|DocumentFragment|NodeList|Array<Node>} node
		 * @param {Node|DocumentFragment} [parent]
		 * @returns {Node|DocumentFragment}
		 */
		append(node, parent = context) {
			if (islist(node)) {
				while (node[0]) {
					parent.append(node[0]);
				}
			} else {
				parent.append(node);
			}
			return node;
		},

		/**
		 * Prepend node(s) and return the node.
		 * @param {Node|DocumentFragment|NodeList|Array<Node>} node
		 * @param {Node|DocumentFragment} [parent]
		 * @returns {Node|DocumentFragment}
		 */
		prepend(node, parent = context) {
			if (islist(node)) {
				while (node.length) {
					parent.prepend(node[node.length - 1]);
				}
			} else {
				parent.prepend(node);
			}
			return node;
		},

		/**
		 * Inject node before and return node.
		 * @param {Node|DocumentFragment} node
		 * @param {Node|DocumentFragment} [target]
		 */
		before(node, target = context) {
			return target.parentNode.insertBefore(node, target);
		},

		/**
		 * Inject node after and return node.
		 * @param {Node|DocumentFragment} node
		 * @param {Node|DocumentFragment} [target]
		 */
		after(node, target = context) {
			return target.parentElement.insertBefore(node, target.nextSibling);
		},

		/**
		 * Replace old node with new node and return the new node.
		 * @param {Node} oldnode
		 * @param {Node} newnode
		 * @retrurns {Node}
		 */
		replace(oldnode, newnode) {
			oldnode.parentNode.replaceChild(newnode, oldnode);
			return newnode;
		},

		/**
		 * Remove spirit element or specified target.
		 * @param {Node|DocumentFragment} [target]
		 */
		remove(target = context) {
			return target.remove();
		},

		/**
		 * Get or set HTML.
		 * TODO: Implement with unsafeHTML to preserve styles in Shadow DOM!
		 * @param {string} markup
		 * @returns {this}
		 */
		html(markup) {
			console.log('TODO: action required');
			if (arguments.length) {
				context.innerHTML = markup;
				return plugin;
			} else {
				return context.innerHTML;
			}
		},
	};
}

export function render(context, plugin, parser = (input) => input) {
	let set3, set4;
	const run = (set) => set && runCallbacks(set, context);
	return {
		/**
		 * @param {TemplateResult} template
		 * @returns {this}
		 */
		render(template) {
			run(set1);
			run(set3);
			litrender(parser(template), context);
			run(set2);
			run(set4);
			return plugin;
		},

		/**
		 * Add prerender callback.
		 * @param {Function} cb
		 * @returns {Function} Returns a function to remove the callback.
		 */
		onprerender(cb) {
			return addCallback(cb, (set3 = set3 || new Set()));
		},

		/**
		 * Add postrender callback.
		 * TODO: rename `onrender`
		 * @param {Function} cb
		 * @param {Set} set
		 * @returns {Function} Returns a function to remove the callback.
		 */
		onpostrender(cb) {
			return addCallback(cb, (set4 = set4 || new Set()));
		},
	};
}

// Scoped ......................................................................

/**
 * Working with the local light (but not the Shadow DOM).
 * @param {SpiritElement} context
 * @param {Object} plugin
 * @returns {Object}
 */
function normal(context, plugin) {
	return {
		closest(selector) {
			return context.closest(selector);
		}
	}
}

/**
 * Working with the *global* light DOM.
 * @returns {Object}
 */
function extras() {
	return {
		/**
		 * @param {string} selector
		 * @param {Function} [calllback]
		 * @returns {HTMLElement}
		 */
		qdoc(selector, callback) {
			return q(document, selector, callback);
		},

		/**
		 * @param {string} selector
		 * @param {Function} [callback]
		 * @returns {Array<HTMLElement>}
		 */
		qdocall(selector, callback) {
			return qall(document, selector, callback);
		},
	};
}

/**
 * Query one.
 * @param {Node|DocumentFragment|Window}
 * @param {string} selector
 * @param {Function} [calllback]
 * @returns {HTMLElement}
 */
function q(context, selector, callback) {
	const elm = context.querySelector(selector);
	callback && elm && callback(elm);
	return elm;
}

/**
 * Query all.
 * @param {Node|DocumentFragment|Window}
 * @param {string} selector
 * @param {Function} [callback]
 * @returns {Array<HTMLElement>}
 */
function qall(context, selector, callback) {
	const elms = Array.from(context.querySelectorAll(selector));
	callback && elms.length && callback(elms);
	return elms;
}

/**
 * Something appears to be a list of nodes?
 * @param {*} thing
 * @returns {boolean}
 */
function islist(thing) {
	return (
		Array.isArray(thing) ||
		NodeList.prototype.isPrototypeOf(thing) ||
		HTMLCollection.prototype.isPrototypeOf(thing)
	);
}

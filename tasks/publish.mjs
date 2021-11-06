import { promises } from 'fs';
import { join, extname } from 'path';

/*
promises.rm('docs/public', { recursive: true })
	.then(() => promises.mkdir('docs/public', { recursive: true }))
	.then(() => run('docs', 'docs/public'))
	.then(() => console.log('OK'));
*/

const docs = (node) => extname(node.name) === '.md';
const files = (nodes) => nodes.filter((node) => node.isFile());
const folders = (nodes) => nodes.filter((node) => node.isDirectory());
const nodes = (dir) => promises.readdir(dir, { withFileTypes: true });

/**
 * @param {string} source
 * @param {string} target
 * @returns {Promise}
 */
function run(source, target) {
	return new Promise((resolve) => {
		nodes(source)
			.then(publishAll(source, target))
			.then(recurseAll(source, target))
			.then(resolve);
	});
}

/**
 * @param {string} source
 * @param {string} target
 * @returns {Function}
 */
function publishAll(source, target) {
	return async (nodes) => {
		await Promise.all(
			files(nodes).filter(docs).map(publishOne(source, target))
		);
		return nodes;
	};
}

/**
 * @param {string} source
 * @param {string} target
 * @returns {Function}
 */
function publishOne(source, target) {
	return async (node) => console.log(node.name, source, target);
}

/**
 * @param {string} source
 * @param {string} target
 * @returns {Function}
 */
function recurseAll(source, target) {
	return async (nodes) =>
		await Promise.all(folders(nodes).map(recurseOne(source, target)));
}

/**
 * @param {string} source
 * @param {string} target
 * @returns {Function}
 */
function recurseOne(source, target) {
	return async ({ name }) => await run(join(source, name), join(target, name));
}

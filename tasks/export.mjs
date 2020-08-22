import { readdirSync, readFileSync, existsSync } from 'fs';
import fsextras from 'fs-extra';
import { join } from 'path';

/**
 * @filedesc
 * Export modules to external directory for use in foreign project without 
 * involving NPM publishing or Git submodules. Note that since we export 
 * the raw sources only, our foreign project is now in charge of building 
 * this project with all required Babel plugins!
 */

/**
 * @param {string} source
 * @returns {Array<string>} 
 */
function getDirectories(source) {
	return readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => join(source, dirent.name));
}

/**
 * @param {string} target 
 * @param {Array<string>} dirs 
 */
function run(target, dirs) {
	target
		? existsSync(target)
			? traverse(target, dirs)
			: console.error('Target not found', target)
		: console.error('Target directory required')
}

/**
 * @param {string} target 
 * @param {Array<string>} dirs 
 */
function traverse(target, dirs) {
	Promise.all(dirs.map(namepair).map(copydir(target)))
		.then(license(target))
		.then(success(target, dirs))
		.catch(console.error);
}

/**
 * @param {string} dir 
 * @returns {Array<string>} 
 */
function namepair(dir) {
	const json = readFileSync(dir + '/package.json');
	const data = JSON.parse(json);
	return [data.name, dir];
}

/**
 * @param {string} target 
 * @returns {Function}
 */
function copydir(target) {
	return ([name, dir]) => fsextras.copy(dir, join(target, name), {
			filter: (src) => !src.includes('node_modules')
		});
}

/**
 * @param {string} target 
 * @param {Array<string>} pairs 
 * @returns {Promise}
 */
function license(target) {
	return fsextras.copy('LICENSE', join(target + '@gui', 'LICENSE'));
}

/**
 * @param {string} target 
 * @param {Array<string>} dirs 
 */
function success(target, dirs) {
	console.log(`${dirs.length} modules exported into ${target}`);
	console.log('Make sure to install all required Babel plugins!')
}

/**
 * Start the whole thing.
 */
run(process.argv[2], [
	'spirits',
	...getDirectories('plugins'),
	...getDirectories('utils')
]);
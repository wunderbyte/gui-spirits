import { readdirSync, readFileSync, existsSync } from 'fs';
import fsextras from 'fs-extra';
import { join } from 'path';

/**
 * @filedesc
 * Export modules to external directory for use in foreign project without
 * involving NPM publishing or Git submodules. Note that our foreign project
 * is now in charge of *transpiling* the code for use in older user agents!
 */

/**
 * @param {string} source
 * @returns {Array<string>}
 */
function getDirectories(source) {
	return readdirSync(source, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => join(source, dirent.name));
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
		: console.error('Target directory required');
}

/**
 * @param {string} target
 * @param {Array<string>} dirs
 */
function traverse(target, dirs) {
	Promise.all(dirs.map(namepair).map(copydir(target)))
		.then(copyfile('LICENSE', target))
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
	return ([name, dir]) =>
		fsextras.copy(dir, join(target, name), {
			filter: (src) => !src.includes('node_modules'),
		});
}

/**
 * @param {string} name
 * @param {string} target
 * @returns {Promise}
 */
function copyfile(name, target) {
	return fsextras.copy(name, join(target + '@gui', name));
}

/**
 * @param {string} target
 * @param {Array<string>} dirs
 */
function success(target, dirs) {
	console.log(`${dirs.length} modules exported into ${target}`);
	console.log('May need to transpile this stuff for older browsers!');
}

/**
 * Start the whole thing.
 */
run(process.argv[2], getDirectories('src'));

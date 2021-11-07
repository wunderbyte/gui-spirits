import MarkdownIt from 'markdown-it';
import prism from 'markdown-it-prism';
import { readdirSync, rmSync, promises } from 'fs';
import { join, extname } from 'path';
import { outputFile } from 'fs-extra';

/**
 * Cleanup traces of previous build by
 * deleting all folders and HTML files.
 * @param {string} source
 * @param {string} target
 * @returns {Promise}
 */
(function cleanup(target) {
	readdirSync(target, { withFileTypes: true })
		.filter((node) => node.name !== 'src')
		.filter((node) => node.isDirectory() || extname(node.name) === '.html')
		.forEach((node) => rmSync(join(target, node.name), { recursive: true }));
})('docs');

/**
 *
 * @param {string} source
 * @param {string} target
 * @returns {Promise}
 */
(function recurse(source, target, level = 0) {
	const nodes = readdirSync(source, { withFileTypes: true });
	nodes
		.filter((node) => node.isFile())
		.filter((node) => extname(node.name) === '.md')
		.forEach(publish(source, target, level));
	nodes
		.filter((node) => node.isDirectory())
		.filter((node) => node.name !== 'public')
		.forEach((node) => {
			recurse(join(source, node.name), join(target, node.name), level + 1);
		});
})('docs/src', 'docs');

/**
 * @param {string} source
 * @param {string} target
 * @param {number} level
 * @returns {Function}
 */
function publish(source, target, level) {
	const md = new MarkdownIt().use(prism);
	return (node) =>
		promises
			.readFile(join(source, node.name))
			.then(String)
			.then((markdown) =>
				outputFile(
					join(target, node.name.replace('.md', '.html')),
					template(md.render(markdown), level).trim()
				)
			);
}

/**
 * @param {string} markup
 * @param {number} level
 * @returns {string}
 */
function template(markup, level) {
	const up = new Array(level).fill('../').join('');
	return `
<!DOCTYPE html>
<html>
	<head>
		<title>TODO</title>
		<meta charset="UTF-8"/>
		<meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
		<link rel="icon" type="image/gif" href="data:image/gif;base64,data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw"/>
		<link rel="stylesheet" href="${up}index.css"/>
		<script type="module" src="${up}index.js"></script>
	</head>
	<body>
		<article>${markup}</article>
	</body>
</html>
`;
}

import AttPlugin from '@gui/plugin-att';
import BoxPlugin from '@gui/plugin-box';
import DOMPlugin from '@gui/plugin-dom';
import CommandPlugin from '@gui/plugin-command';
import ShadowPlugin from '@gui/plugin-shadow';
import { summon } from '@gui/spirits';

const plugins = new Map([
	['att', AttPlugin],
	['box', BoxPlugin],
	['dom', DOMPlugin],
	['command', CommandPlugin],
	['shadow', ShadowPlugin]
]);

const append = (target, elm) => target.appendChild(elm);
const create = (name) => document.createElement(name);
const locate = (name) => document.querySelector(name);

beforeEach(() => append(document.body, create('stage')));
afterEach(() => locate('stage').remove());

/**
 * Register component and insert it. Returns a function to remove it.
 * @param {string} tag 
 * @param {Function} controller 
 * @returns {Function} cleanup
 */
function test(tag, controller) {
	summon(tag, controller, plugins);
	append(locate('stage'), create(tag));
}

describe('AttPlugin', function () {
	it('contains spec with an expectation', (done) => {
		test('plugin-att', ({ att }) => {
			att.set('string', 'ok').set('number', 23).set('boolean', false);
			expect(att.get('string')).toBe('ok');
			expect(att.get('number')).toBe(23);
			expect(att.get('boolean')).toBe(false);
			expect(att.has('boolean')).toBe(true);
			done();
		});
	});
});

describe('CommandPlugin', function () {
	it('contains spec with an expectation!', () => {
		expect(true).toBe(true);
	});
});

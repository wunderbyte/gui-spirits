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
	['shadow', ShadowPlugin],
]);

const append = (target, elm) => target.appendChild(elm);
const create = (name) => document.createElement(name);
const locate = (name) => document.querySelector(name);
const later = (cb) => setTimeout(cb, 50);

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
	it('Can can set and get attributes', (done) => {
		test('plugin-att-get-set', ({ att }) => {
			att.set('string', 'ok').set('number', 23).set('boolean', false);
			expect(att.get('string')).toBe('ok');
			expect(att.get('number')).toBe(23);
			expect(att.get('boolean')).toBe(false);
			expect(att.has('boolean')).toBe(true);
			done();
		});
	});

	it('Can observe attributes', (done) => {
		test('plugin-att-observe', ({ att }) => {
			const bad = () => expect(0).toBe(1);
			const res = {};
			att
				.on('fail', bad)
				.off('fail', bad)
				.on('called', (value) => (res.called = value))
				.on('boolean', (value) => (res.boolean = value))
				.on(['one', 'two', 'three'], (value, name) => (res[name] = value))
				.set('called', true)
				.set('boolean', true)
				.set('one', 1)
				.set('two', 2)
				.set('three', 3)
				.set('fail', 'revoked');
			later(() => {
				expect(res.called).toBe(true);
				expect(res.boolean).toBe(true);
				expect([res.one, res.two, res.three]).toEqual([1, 2, 3]);
				done();
			});
		});
	});
});

describe('CommandPlugin', function () {
	it('contains spec with an expectation!', () => {
		expect(true).toBe(true);
	});
});

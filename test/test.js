// GUI Spirits official plugins (third party)
import AttPlugin from '@gui/plugin-att';
import BoxPlugin from '@gui/plugin-box';
import CommandPlugin from '@gui/plugin-command';
import { summon } from '@gui/spirits';

const plugins = new Map([
	['att', AttPlugin],
	['box', BoxPlugin],
	['command', CommandPlugin],
]);

function test(tag, controller) {
	summon(tag, controller, plugins);
	document.body.appendChild(document.createElement(tag)).remove();
}

describe('AttPlugin', function () {
	it('contains spec with an expectation', () => {
		test('plugin-att', ({ att }) => {
			att.set('string', 'ok').set('number', 23).set('boolean', false);
			expect(att.get('string')).toBe('ok');
			expect(att.get('number')).toBe(23);
			expect(att.get('boolean')).toBe(false);
			expect(att.has('boolean')).toBe(true);
		});
	});
});

describe('CommandPlugin', function () {
	it('contains spec with an expectation!', () => {
		expect(true).toBe(true);
	});
});

import { summon, html, css } from '@gui/spirits';

import {
	BoxPlugin,
	CSSPlugin,
	DOMPlugin,
	EventPlugin,
	ShadowPlugin
} from '@gui/plugins';

const stylesheet = css`h1 { color: red; }`;
const plugins = new Map([
  ['box', BoxPlugin],
  ['css', CSSPlugin],
	['dom', DOMPlugin],
	['event', EventPlugin],
  ['shadow', ShadowPlugin]
]);

summon('pv-testing', controller, plugins);

function controller({ shadow, element, event, ondisconnect, onreconnect, onexorcise }) {
	const api1 = shadow.adopt(stylesheet);
	const api2 = shadow.empty();
	console.log('same', api1 === api2);
	shadow.onprerender(() => console.log('pre', shadow.q('h1')));
	shadow.onpostrender(() => console.log('post', shadow.q('h1')));
	shadow.render(html`<h1>Hello</h1>`);
	ondisconnect(() => console.log('disconnect'));
	onreconnect(() => console.log('reconnect'));
	onexorcise(() => console.log('exorcise'));
	event.on('click', element, function one() {
		console.log('one');
		document.body.append(element);
		event.off('click', element, one);
		event.on('click', element, function two() {
			console.log('two');
			element.remove();
		});
	});
}


(elm => {
	document.body.append(elm);
	/*
	setTimeout(() => {
		document.body.append(elm);
		setTimeout(() => {
			elm.remove();
		}, 1000);
	}, 1000);
	*/
})(document.createElement('pv-testing'));
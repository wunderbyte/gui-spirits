### Installation

Not possible, since it isn't published anywhere.

### What it is
GUI Spirits is the simplest [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) library you can imagine. It offers no new things to do, but focuses instead on *how* you do it by providing an API based entirely on functions. Since no classes are involved, there's also no `this` keyword to keep track of, no class hierarchy to maintain, no decorators, no private or static methods. Just functions.

### What it's not
It's not a "purely functional" thing going on.

### Components

The `summon` function registers a Custom Element with a callback function to invoke as soon as the element is found in the DOM. The callback recieves an object `spirit` as the single argument.


```js
import { summon } from '@gui/spirits';
summon('my-component', (spirit) => {
	spirit.element.classList.add('inserted');
});
```

The `spirit` has a property `element` that lets you handle the Custom Element. It also comes with some basic [lifecycle hooks](#lifecycle).
 
 
### Interface
 

 
 That's bascially all there is to it. But you can enhance your workflow by collecting functionality in a *plugin*.


### Plugins

Plugin are simply functions that takes the Custom Element as an argument and returns an interface to operate on it. Let's create a simple plugin to maintain CSS classnames. 


```
function CSSPlugin(element) {
	return {
		add(...names) {
			element.classList.add(...names);
		},
		delete(...names) {
			element.classList.remove(...names);
		},
		has(name) {
			return element.classList.contains(name);
		}
	};
}
```

We'll register the plugin as a property of the `spirit` by passing an iterable to the `summon` method.


```js
summon('my-component', (spirit) => {
	spirit.css.add('inserted'); // using the plugin!
}, [
	['css', CSSPlugin]
]);
```

This of course becomes tedious to set up whenever we create a new component, so we will instead assign our plugins once and for all and reexport the `summon` method with all the plugins baked in. Plugins are instantiated [lazily](https://en.wikipedia.org/wiki/Lazy_initialization), so we can register as many as we like even if they are rarely used. Let's register some reference plugins to see how that might work.


```js
import { summon as register } from '@gui/spirits';
import AttPlugin from '@gui/plugin-att';
import CSSPlugin from '@gui/plugin-css';
import DOMPlugin from '@gui/plugin-dom';
import EventPlugin from '@gui/plugin-event';

export function summon(controller) {
	return register(controller,  [
		['att', AttPlugin], // working with attributes
		['css', CSSPlugin], // working with classnames
		['dom', DOMPlugin], // working with the DOM
		['event', EventPlugin] // working with events
	]);
}
```

Make sure to import the `summon` function from the new location.

```js
import { summon } from './base-component';
summon('my-component', (spirit) => {
    spirit.css.add('inserted');
});
```

### Destructuring

You can [destructure](https://www.javascripttutorial.net/es6/javascript-object-destructuring/) the `spirit` for a nice and compact syntax.

```js
summon('my-component', controller);

function controller({ att, css, dom, event }) {
	att.set('my-attribute', 'my-value');
	css.add('my-classname');
	dom.text('Click me!');
	event.onclick(() => alert('Clicked!'));
}
```

As the code grows, you'll want to split it into multiple functions. Fortunately, the spirit has a property `spirit` that points to the spirit itself. This facilitates *recursive destructuring* as seen below.

```js
import import { summon } from './component';

summon('my-component', controller);

function controller({ att, spirit }) {
	att.set('my-attribute', 'my-value');
	updateCSS(spirit);
}

function updateCSS({ css, spirit }) {
	css.add('my-classname');
	updateDOM(spirit);
}

function updateDOM({ dom, spirit }) {
	dom.text('Click me!');
	updateEvents(spirit);
}

function updateEvents({ event }) {
	event.onclick(() => alert('Clicked!'));
}

```
It's recommended to pass the whole `spirit` instead of a single plugin.

### Lifecycle
 
Unlike with conventional components, there is no code executed before the element is attached to the DOM. This means that the callback function used to register the component, let's call it the *controller function*, works much like the canonical `connectedCallback`. The `spirit` offers additional methods to detect whenever the elements gets moved around or removed for good.

```js
summon('my-component', (spirit) => {
	spirit.ondisconnect(() => console.log('removed'));
	spirit.onreconnect(() => console.log('inserted again'));
	spirit.onexorcise(() => console.log('removed for good'));
});
```

* `ondisconnect` 
* `onreconnect`
* `onexorcise`
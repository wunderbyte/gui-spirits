### Installation

Not possible, since it isn't published anywhere.

### What it is
GUI Spirits is the simplest [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) library you can imagine. It offers no new things to do, but focuses instead on *how* you do it by providing an API based entirely on functions. Since no classes are involved, there's also no `this` keyword to keep track of, no class hierarchy to maintain, no decorators, no private or static methods, just functions. Not that there's anything wrong with these things, it's just more fun without them.

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

The `spirit` has a property `element` that lets you handle the Custom Element. It also comes with some basic lifecycle hooks. They are rarely used, so let's discuss them later. That's bascially all there is to it! But you can enhance your workflow by collecting common operations in a *plugin*.

### Plugins

The plugin is simply a function that takes the Custom Element as an argument and returns an interface to operate on it. Let's create a simple plugin to maintain CSS classnames. 


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

We'll register the plugin as a property of the spirit by passing a second argument to the `summon` method.


```js
summon('my-component', (spirit) => {
	spirit.css.add('inserted');
}, [
	['css', CSSPlugin],
	['some', SomePlugin],
	['other', OtherPlugin]
]);
```

### Destructuring

Hello *recursive destructuring*.


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
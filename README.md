```console
 ██████  ██    ██ ██     ███████ ██████  ██ ██████  ██ ████████ ███████ 
██       ██    ██ ██     ██      ██   ██ ██ ██   ██ ██    ██    ██      
██   ███ ██    ██ ██     ███████ ██████  ██ ██████  ██    ██    ███████ 
██    ██ ██    ██ ██          ██ ██      ██ ██   ██ ██    ██         ██ 
 ██████   ██████  ██     ███████ ██      ██ ██   ██ ██    ██    ███████ 
```                                                                     
                                                                        
**GUI Spirits** is the simplest [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) library you can imagine. It offers no new things to do, but focuses instead on *how* you do it by providing an API based entirely on functions. Since no classes are involved, there's no `this` keyword to keep track of, no class hierarchy to maintain, no private or static methods, no decorators, just functions.

### Installation
This library is unpublished, so you'll need to copy the `src` folder into your project and boot it up with a [monorepo manager](https://blog.bitsrc.io/11-tools-to-build-a-monorepo-in-2021-7ce904821cc2) since the folder contains multiple packages. Make sure to test in your oldest browser to see if you need Babel plugins or equivalent to support the syntax. There's an NPM script that can copy the files for you.

```console
npm run export ../myproject/mylibs/
```

### Components
The library exports a single function `summon` that will register a Custom Element with a *controller function* to be invoked when the element is found in the DOM. The function recieves an object `spirit` with a property `element` that lets you handle the Custom Element.


```js
import { summon } from '@gui/spirits';

summon('my-component', function controller(spirit) {
  spirit.element.classList.add('inserted');
});
```

By returning an object, the Custom Element can expose methods and properties. The component must be document-connected before these methods become available.


```js
summon('my-component', (spirit) => {
  return {
    toggle() {
      element.classList.toggle('toggled');
    },
    get toggled() {
      return element.classList.contains('toggled');
    }
  }
});
```

The Spirit also provides some basic [lifecycle hooks](#lifecycle) and that's bascially all there is to it. Before you begin, you can enhance your workflow by collecting related functionality in a *plugin* and you might want to take a look at our [reference plugins](WIKI).


### Plugins

Let's create a simple plugin to maintain CSS classnames. 

```js
/**
 * @param {CustomElement} element
 */
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

Plugins are simply functions that takes the Custom Element as an argument and returns an interface to operate on it. We'll register the plugin as a property of the Spirit by passing an iterable to the `summon` method. Let's assign it to "css".


```js
summon('my-component', (spirit) => {
  spirit.css.add('inserted'); // using the plugin!
}, [
  ['css', CSSPlugin]
]);
```

This of course becomes tedious to set up whenever we create a new component, so we will assign our plugins once and for all and reexport the `summon` method with all the plugins baked in. Plugins are instantiated [lazily](https://en.wikipedia.org/wiki/Lazy_initialization), so we can register as many plugins as we like even if they are rarely used. Let's see how that works with some reference plugins.


```js
import { summon as register } from '@gui/spirits';
import AttPlugin from '@gui/plugin-att';
import CSSPlugin from '@gui/plugin-css';
import DOMPlugin from '@gui/plugin-dom';
import EventPlugin from '@gui/plugin-event';

/**
 * @param {Function} controller
 */
export function summon(controller) {
  return register(controller,  [
    ['att', AttPlugin], // working with attributes
    ['css', CSSPlugin], // working with classnames
    ['dom', DOMPlugin], // working with the DOM
    ['event', EventPlugin] // working with events
  ]);
}
```

Once the file is saved, make sure to import the enhanced `summon` function from the new location.

```js
import { summon } from './base-component';
summon('my-component', (spirit) => {
    spirit.css.add('inserted');
});
```

You can study the [plugin authoring guide](LINK!) before you create your first plugin, but let's first see how plugins can be used in real code.


### Destructuring

You can [destructure](https://www.javascripttutorial.net/es6/javascript-object-destructuring/) the Spirit like any other object for a nice and compact syntax.

```js
summon('my-component', controller);

/**
 * Destructuring plugins.
 * @param {Spirit} spirit
 */
function controller({ att, css, dom, event }) {
  att.set('my-attribute', 'my-value');
  css.add('my-classname');
  dom.text('Click me!');
  event.onclick(() => alert('Clicked!'));
}
```

As the code grows, you'll want to split this into multiple functions. To this purpose, the Spirit facilitates *recursive destructuring* via a property `spirit` that points to the Spirit itself. 

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

Whenenver you create a new function, consider passing the whole Spirit instead of just any single plugin to keep them all at hand as the feature list grows.


### Lifecycle
 
Unlike with conventional web components, we don't have any code that gets executed before the element is attached to the DOM. This guarantees that the code can safely measure the elements dimensions or access the `parentNode` without running into `0` or `null` under hard to fix conditions. This means that we don't need a special callback to detect when the element is first positioned in the DOM, the controller function does that for us. The spirit however exposes two methods to detect whenever the element gets *moved around* in the DOM.


```js
summon('my-component', ({ ondisconnect, onreconnect }) => {
  console.log('first detected in the DOM');
  ondisconnect(() => console.log('removed'));
  onreconnect(() => console.log('inserted again'));
});
```

If the element is removed from the document structure and not re-inserted more or less immediately, the spirit will be permanently *exorcised*. At this point, it stops working altogether and attempts to address the spirit's plugins, properties or methods will lead to errors. Fortunately, the spirit offers a callback to be executed just before this happens. This willl come in handy as an opportune moment to terminate whatever resource intensive operation the component  may have scheduled.


```js
summon('my-component', ({ onexorcise }) => {
  const i = setTimeout(fetchdata, 1000);
  onexorcise(() => {
  	console.log('removed for good');
    clearTimeout(i);
  });
});
```


### Plugin guide

TODO: Write short guide, remember `this` keyword and `onexorcise` method (and support `ondisconnect` and `onreconnect`). Also a note on inter-plugin communication.
```js
 ██████  ██    ██ ██     ███████ ██████  ██ ██████  ██ ████████ ███████ 
██       ██    ██ ██     ██      ██   ██ ██ ██   ██ ██    ██    ██      
██   ███ ██    ██ ██     ███████ ██████  ██ ██████  ██    ██    ███████ 
██    ██ ██    ██ ██          ██ ██      ██ ██   ██ ██    ██         ██ 
 ██████   ██████  ██     ███████ ██      ██ ██   ██ ██    ██    ███████ 
```                                                                     
                                                                        
**GUI Spirits** is a simple [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) library. It offers no new things you can do, but focuses instead on *how* you do it by providing an API based entirely on functions. Since no classes are involved, there is no `this` keyword to keep track of, no class hierarchy to maintain, no private or static methods, no decorators, just functions.

## Installation
This library is yet unpublished, so you'll need to copy the `src` folder into your project and boot it up with a [monorepo manager](https://blog.bitsrc.io/11-tools-to-build-a-monorepo-in-2021-7ce904821cc2) since the folder contains multiple packages. Make sure to test in your oldest browser to see if you need Babel plugins or equivalent to support the syntax. There's an NPM script that can exports the files for you.

```console
npm run export ../myproject/mylibs/
```

## Components
The library exports a single function `summon` that will register a Custom Element with a *possessor function* to be invoked when the element is found in the DOM. The function recieves an object `spirit` with a property `element` that lets you handle the Custom Element.


```js
import { summon } from '@gui/spirits';
summon('my-component', function onpossess(spirit) {
  spirit.element.classList.add('inserted');
});
```

The element can expose methods and properties. Note that the element must be document-connected before this interface becomes available.


```js
summon('my-component', ({ element }) => {
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

The Spirit also provides some basic [lifecycle hooks](#lifecycle) and that's bascially all there is to it. You can enhance your workflow by collecting related functionality in a *plugin* and you might also want to take a look at some [reference plugins](plugins/).

## Plugins

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

Plugins are simply functions that takes the element as an argument and returns an interface to operate on it. We'll register the plugin as a property of the Spirit by passing an iterable to the `summon` method. Let's assign it to the property name `css`.


```js
summon('my-component', (spirit) => {
  spirit.css.add('inserted'); // using the plugin!
}, [
  ['css', CSSPlugin]
]);
```

This of course becomes tedious to set up whenever we create a new component, so we will assign our plugins once and for all and re-export the `summon` method with all the plugins baked in. Plugins are instantiated [lazily](https://en.wikipedia.org/wiki/Lazy_initialization), so we can register as many plugins as we like even if they are rarely used. Let'stry that with some [reference plugins](plugins/).


```js
import { summon as oldsummon } from '@gui/spirits';
import AttPlugin from '@gui/plugin-att';
import CSSPlugin from '@gui/plugin-css';
import DOMPlugin from '@gui/plugin-dom';
import EventPlugin from '@gui/plugin-event';

/**
 * @param {Function} possessor
 */
export function summon(possessor) {
  return oldsummon(possessor,  [
    ['att', AttPlugin], // working with attributes
    ['css', CSSPlugin], // working with classnames
    ['dom', DOMPlugin], // working with the DOM
    ['event', EventPlugin] // working with events
  ]);
}
```

Once the file is saved, make sure to import your enhanced `summon` function from the new location.

```js
import { summon } from './my-spirits';
summon('my-component', (spirit) => {
    spirit.css.add('inserted');
});
```

You can study the [plugin authoring guide](LINK!) before you create your first plugin, but let's first see how plugins can be used in real code.


## Destructuring

You can [destructure](https://www.javascripttutorial.net/es6/javascript-object-destructuring/) the Spirit like any other object for a nice and compact syntax.

```js
summon('my-component', possess);

/**
 * Destructuring plugins.
 * @param {Spirit} spirit
 */
function possess({ att, css, dom, event }) {
  att.set('my-attribute', 'my-value');
  css.add('my-classname');
  dom.text('Click me!');
  event.onclick(() => alert('Clicked!'));
}
```

As complexity grows, you'll want to split this into multiple functions. To this purpose, the Spirit facilitates *recursive destructuring* via a property `spirit` that points to the Spirit itself. Simply forward this property to destructure the Spirit forever.

```js
import { summon } from './my-spirits';

summon('my-component', possess);

function possess({ att, spirit }) {
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

Whenenver you create a new function, consider passing the whole Spirit instead of just a single plugin. This will let you keep all your plugins at hand when you need them later.


## Lifecycle
 
Spirits never execute any code before the element is connected to page since this convention guarantees that the code can safely measure the elements dimensions or access the `parentNode` without running into `0` or `null`. This means that we don't need a special callback to detect when this happens, the possessor function does that for us. The spirit however offers two methods to detect whenever the element gets *moved around* on the page.


```js
summon('my-component', ({ ondetach, onattach }) => {
  console.log('first detected in the DOM');
  ondetach(() => console.log('removed'));
  onattach(() => console.log('inserted again'));
});
```

These methods both return a function to cancel the callback.

If the element is removed from the document structure and not re-inserted more or less immediately, the spirit will be permanently *exorcised*. At this point, it stops working altogether and attempts to address the spirit's plugins, properties or methods will lead to errors. The spirit offers to execute a callback just before this happen.


```js
summon('my-component', ({ onexorcise }) => {
  const loop = setInterval(myupdate, 1000);
  onexorcise(() => clearInterval(loop));
});
```

## Plugin guide
TODO: Write short guide. Remember `this` keyword to support destructuring. Remember `onexorcise` method (and support `ondetach` and `onattach`). Also a note on inter-plugin communication.

> TODO: Short introduction to higher order functions.

> TODO: Also implement and document "enterprise mode" to obscure the occult terminology going on with spirits and possesion and what not.
---
title: GUI Spirits
class: index
---

<!-- TODO: Github link goes here!
<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" focusable="false" viewBox="0 0 12 12">
  <path fill="currentColor" d="M6 0a6 6 0 110 12A6 6 0 016 0zm0 .98C3.243.98 1 3.223 1 6a5.02 5.02 0 003.437 4.77.594.594 0 00.045.005c.203.01.279-.129.279-.25l-.007-.854c-1.39.303-1.684-.674-1.684-.674-.227-.58-.555-.734-.555-.734-.454-.312.034-.306.034-.306.365.026.604.288.708.43l.058.088c.446.767 1.17.546 1.455.418.046-.325.174-.546.317-.672-1.11-.127-2.277-.558-2.277-2.482 0-.548.195-.996.515-1.348l-.03-.085c-.064-.203-.152-.658.079-1.244l.04-.007c.124-.016.548-.013 1.335.522A4.77 4.77 0 016 3.408c.425.002.853.058 1.252.17.955-.65 1.374-.516 1.374-.516.272.692.1 1.202.05 1.33.32.35.513.799.513 1.347 0 1.93-1.169 2.354-2.283 2.478.18.155.34.462.34.93l-.006 1.378c0 .13.085.282.323.245A5.02 5.02 0 0011 6C11 3.223 8.757.98 6 .98z"/>
</svg>
-->

# GUI Spirits
A simple [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) library.

**GUI Spirits** offers no new things to do, but focuses instead on *how* you do it by providing an API based entirely on functions. Since no classes are involved, there is no `this` keyword to keep track of, no class hierarchy to maintain, no private or static methods, no decorators, just functions.

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

Once the file is saved, make sure to import your enhanced function from the new location.

```js
import { summon } from './my-spirits';
summon('my-component', (spirit) => {
    spirit.css.add('inserted');
});
```

You can study the [plugin authoring guide](#plugin-guide) before you create your first plugin, but let's first see how plugins can be used in real code.


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

As features get added, you will eventually want to split this into multiple functions. To this purpose, the Spirit facilitates *recursive destructuring* via a property `spirit` that points to the Spirit itself. Simply forward this property to destructure the Spirit forever.


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
 
Spirits never execute any code before the element is connected to page. This convention guarantees that we can safely measure the elements dimensions or access the `parentNode` without running into `0` or `null`. But this also means that we don't need a special callback to detect when insertion happens, the possessor function does that for us. The spirit however offers two methods to detect whenever the element gets *moved around* in the DOM.


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
TODO: Write short guide. Remember `this` keyword to support destructuring. Remember `onexorcise` method (and support `ondetach` and `onattach` in plugins). Also a note on inter-plugin communication and somehing about higher order functions.

> TODO: Also implement and document "enterprise mode" to obscure the occult terminology going on with spirits and possesion and what not.
# THREE Object Janitor

[![Version](https://badgen.net/npm/v/three-janitor?color=green)](https://www.npmjs.com/package/three-janitor)

> A janitor is a utility class that can be used to clean up resources, especially GPU allocated ones, that are no longer needed by your program.

## Installation

The library only requires the peer dependency [three](https://github.com/mrdoob/three.js/).

```sh
npm install three three-janitor
```

## Usage

```ts
import { Janitor } from "three-janitor"

const janitor = new Janitor();

// Object3D
const myObject = new THREE.Mesh(...);
janitor.mop(myObject);

// add callbacks with optional label
const music = new Beethoven();
music.play();
janitor.mop(() => music.stop(), "music")

// add another janitor to the top level janitor
// this works sinsce Janitor is a `Disposable` type anyway
janitor.mop(someNestedFunctionThatReturnsAJanitor());

// html elements are tracked and then removed from their parents when dispose() is called
const myElement = document.createElement("div");
janitor.mop(myElement);

// when you're done with it, clean it all up.
janitor.dispose();

```

### When calling `Janitor.dispose()`
It will go through all the following:

- For `Object3DLike`
   - disposes any `geometry`
   - disposes any and all `material` or `material[]`
   - visits each `material` and disposes any `Texture` property
   - visits each `uniform` and disposes any `Texture` value
   - visits `children` and repeats the process.
   - supports Object3DLike objects like `Point`
   - works great for entire `Scene` objects.
- For callbacks it will simply call them.
- For `Disposable` objects it will call `dispose()`
- For HTMLElement objects it will call `remove()`
- It will accept iterable types containing any of the above.


## Utilities

```ts
// labels for debug logging dispose() calls
const janitor = new Janitor("My Module"); 
Janitor.logLevel = JanitorLogLevel.Info;
```

```ts
// single line method, returns the argument
const myOtherObject = janitor.mop(new THREE.Mesh(...));
```


```ts
// call dispose directly without mop()
janitor.dispose(myObj, myObj2); 
```

```ts
// same thing statically
Janitor.trash(myObj); 
```

```ts
// add event listeners and don't worry about cleaning up
janitor.addEventListener(window, "click", () => alert(`I'm good to go`));
```

```ts
// same thing for using node like event emitters
janitor.on(ipcRenderer, "message", () => ...);
```

```ts
// aliases for your preference
janitor.add();
janitor.track();
janitor.mop();
```
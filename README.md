# THREE Object Janitor

[![Version](https://badgen.net/npm/v/three-janitor?color=green)](https://www.npmjs.com/package/three-janitor)

A janitor is a utility class that can be used to clean up resources (particularly GPU allocated) that are no longer needed. Zero-dependencies.

## Installation

This library requires the peer dependency [three](https://github.com/mrdoob/three.js/).

```sh
npm install three three-janitor
```

## Usage

```ts
import { Janitor } from "three-janitor"

const janitor = new Janitor();

// track an Object3D
const myObject = new THREE.Mesh(...);
janitor.mop(myObject);

// or simply on a single line
const myOtherObject = janitor.mop(new THREE.Mesh(...));

// add callbacks
const music = new PretendMusic();
music.play();
// tracking the dispose method as well as adding a label (optional) for debug purposes
janitor.mop(() => music.stop(), "music")

// add another janitor to the top level janitor
// this works sinsce Janitor is a `Disposable` type anyway
janitor.add(someOtherFunctionThatReturnsAJanitor());

// when you're done with it, clean it all up.
janitor.dispose();

```

### When calling `Janitor.dispose()`
- It will go through all the 
- For `Object3D`, our janitor will visit each child object and call `dispose()` on any `Texture`, `Material`, or `BufferGeometry`. It will then dispose the parent object as well.
- For call backs it will simply call/execute them.
- For `Disposable` objects it will call `dispose()`
- It will accept Iterable types for all of the above.


### Extra helper methods

```ts
const janitor = new Janitor("my Module"); // labels for debugging

janitor.dispose(myObj, myObj2); // call dispose directly without tracking

Janitor.trash(myObj); // same thing statically

// add event listeners and don't worry about cleaning up
janitor.addEventListener(window, "click", () => alert(`I'm good to go`));

// when in a node environment or using node like event emitters
janitor.on(ipcRenderer, "message", () => ...);


```
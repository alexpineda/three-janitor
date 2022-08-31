# The Janitor

[![Version](https://badgen.net/npm/v/three-janitor?color=green)](https://www.npmjs.com/package/three-janitor)

A simple, zero-dependency library to help track your objects and dispose of them, primarily for vanilla [three.js](https://threejs.org/)

## Installation

This library requires the peer dependency [three](https://github.com/mrdoob/three.js/).

```sh
npm install three three-janitor
```

## Usage

```ts
const janitor = new Janitor();

// add an Object3D
const myObject = new THREE.Mesh(...);
janitor.add(myObject);

// or just on a single line
const myOtherObject = janitor.add(new THREE.Mesh(...));

// add callbacks
janitor.add(() => { /* my clean up function*/})

// add another janitor to the top level janitor? why not!
janitor.add(someOtherFunctionThatReturnsAJanitor());

const disposable = {
    dispose() {
        // clean up!
    }
}
// implement a dispose method on your object for easy cleanup!
janitor.add(disposable)

// when you're done with it, clean it all up! woohoo!
janitor.dispose();

```

### How does it clean up so well? My code smells amazing now!
> Glad you asked! We use a patented formula :)
- For `Object3D`, our janitor will visit each child object and call `dispose()` on any `Texture`, `Material`, or `BufferGeometry`. It will then dispose the parent object as well.
- For call backs it will simply call/execute them.
- For `Disposable` objects it will call `dispose()`
- That's it!


### Extra helper methods

```ts
// add event listeners and don't worry about cleaning up
janitor.addEventListener(window, "click", () => alert(`I'm good to go`));

// interval
janitor.setInterval(() => console.log("interval!"), 5000);

```
### Contributions welcome.

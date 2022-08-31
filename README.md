# `three-janitor`

A simple library to track your objects and dispose of them!


## Usage

```ts
const janitor = new Janitor();

const myObject = new THREE.Mesh(...);
// add an Object3D
janitor.add(myObject);

// or just on a single line
const myOtherObject = janitor.add(new THREE.Mesh(...));

// add callbacks
janitor.add(() => { /* my clean up function*/})

// add another janitor to the top level janitor? why not!
janitor.add(someOtherFunctionThatReturnsAJanitor());

// add event listeners and don't worry about cleaning up
janitor.add(window, "click", evt => alert(`I'm good to go`));

// or manually
const _listener = evt => alert(`I'm good to go`);
window.addEventListener("click", evt);
janitor.add(() => window.removeEventListener(_listener));

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

### How does it clean up so well!? My code smells amazing now!
> Glad you asked! We use a patented formula :)
- For `Object3D`, our janitor will visit each child object and call `dispose()` on any `Texture`, `Material`, or `BufferGeometry`. It will then dispose the parent object as well.****
- For call backs it will simply call/execute them.
- For addEventListener it will call removeEventListener.
- For `Disposable` objects it will call `dispose()`
- That's it!

### Contributions welcome.
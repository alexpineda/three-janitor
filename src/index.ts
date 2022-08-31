import { Object3D } from "three";
import { disposeObject3D } from "./dispose-mesh";

interface Disposable {
    dispose(): void;
}
type Callback = () => void;
type SupportedJanitorTypes = Object3D | Disposable | Callback;

/**
 * A janitor is a utility class that can be used to clean up resources that are no longer needed.
 */
export class Janitor {
    #objects = new Set<Object3D>();
    #disposable = new Set<Disposable>();
    #callbacks = new Set<Callback>();

    /**
     * @param obj A compatible disposable object to track. Same as janitor.add();
     */
    constructor(dispose?: SupportedJanitorTypes) {
        if (dispose) {
            this.add(dispose);
        }
    }

    /**
     * 
     * @param element The dispatching element
     * @param event The name of the event
     * @param callback The event listener
     * @param options Any event listener options
     */
    addEventListener(element: { addEventListener: Function, removeEventListener: Function }, event: string, callback: Function, options?: AddEventListenerOptions) {
        element.addEventListener(event, callback, options);
        this.add(() => element.removeEventListener(event, callback));
    }

    /**
     * Helper for adding and removing setInterval
     * @param callback A callback function
     * @param interval ms interval to call the callback
     */
    setInterval(callback: Callback, interval: number) {
        const _i = setInterval(callback, interval);
        this.add(() => clearInterval(_i));
    }

    /**
     * @param obj A compatible disposable object to track
     */
    add<T extends SupportedJanitorTypes>(obj: T): T {
        if (obj instanceof Object3D) {
            this.object3d(obj);
        } else if ("dispose" in obj) {
            this.disposable(obj);
        } else if (typeof obj === "function") {
            this.callback(obj);
        } else {
            throw new Error("Unsupported type");
        }
        return obj;
    }

    /**
     * Helper for connecting and disconnecting AudioNodes.
     * @param args An array of AudioNodes to connect and later disconnect
     */
    connectAudio(...args: AudioNode[]) {
        for (let i = 0; i < args.length - 2; i++) {
            args[i].connect(args[i + 1])
        }
        this.add(() => {
            for (let i = 0; i < args.length - 2; i++) {
                args[i].disconnect(args[i + 1])
            }
        });
    }

    /**
     * @param callback A callback function
     */
    callback(callback: Callback) {
        this.#callbacks.add(callback);
    }

    /**
     * @param obj A disposable object
     */
    disposable(obj: Disposable) {
        this.#disposable.add(obj);
    }

    /**
     * @param obj A three.js object
     */
    object3d(obj: Object3D) {
        this.#objects.add(obj);
    }

    /**
     * Dispose all objects and callbacks
     */
    dispose() {

        if (this.#objects.size) {
            for (const obj of this.#objects) {
                disposeObject3D(obj);
                obj.removeFromParent();
            }
            this.#objects.clear();
        }

        if (this.#callbacks.size) {
            for (const cb of this.#callbacks) {
                cb();
            }
            this.#callbacks.clear();
        }

        if (this.#disposable.size) {
            for (const disposable of this.#disposable) {
                disposable.dispose();
            }

            this.#disposable.clear();
        }

    }

}

import { Object3D } from "three";
import { disposeObject3D } from "./dispose-mesh";

interface Disposable {
    dispose(): void;
}
type Callback = () => void;
type SupportedJanitorTypes = Object3D | Disposable | Callback;

export class Janitor {
    #objects = new Set<Object3D>();
    #disposable = new Set<Disposable>();
    #callbacks = new Set<Callback>();

    constructor(dispose?: SupportedJanitorTypes) {
        if (dispose) {
            this.add(dispose);
        }
    }

    addEventListener(element: { addEventListener: Function, removeEventListener: Function }, event: string, callback: Function, options?: AddEventListenerOptions) {
        element.addEventListener(event, callback, options);
        this.add(() => element.removeEventListener(event, callback));
        return this;
    }

    setInterval(callback: Callback, interval: number) {
        const _i = setInterval(callback, interval);
        this.add(() => clearInterval(_i));
    }

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

    callback(callback: Callback) {
        this.#callbacks.add(callback);
    }

    disposable(obj: Disposable) {
        this.#disposable.add(obj);
    }

    object3d(obj: Object3D) {
        this.#objects.add(obj);
    }

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

import { withErrorMessage } from "./utils/with-error-message";
import { Object3D } from "three";
import { disposeMesh, Object3DLike } from "./dispose-mesh";


function isObject3DLike(obj: any): obj is Object3DLike {
    return obj && ("material" in obj && "geometry" in obj) || ("children" in obj && obj instanceof Object3D);
}

function isIterable(obj: any): obj is Iterable<any> {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}
interface Disposable {
    dispose: () => void;
}

type EmptyFn = () => void;

type NodeJSLikeEmitter = { on: (...args: any[]) => void, off: (...args: any[]) => void }

type SupportedJanitorTypes = Object3D | Disposable | EmptyFn | HTMLElement | Iterable<SupportedJanitorTypes>;

export enum JanitorLogLevel {
    None,
    Info,
    Verbose,
    Debug
}

export class Janitor {
    static #level = 1;
    static logLevel = JanitorLogLevel.None;

    #trackables = new Set<SupportedJanitorTypes>();
    #label: string | null = null;
    #labels = new WeakMap<SupportedJanitorTypes, string>();
    #keepTrackablesAfterDispose: boolean;
    logger = console;

    // synonym for mop
    track: (trackable: SupportedJanitorTypes, label?: string) => void;
    add: (trackable: SupportedJanitorTypes, label?: string) => void;

    #log(message: string, level: JanitorLogLevel) {
        if (Janitor.logLevel >= level) {
            this.logger.debug(message);
        }
    }

    constructor(label: string | null | undefined | boolean = false, keepTrackablesAfterDispose?: boolean) {
        if (typeof label === "boolean") {
            this.#keepTrackablesAfterDispose = label;
        } else {
            this.#label = label ?? "";
            this.#keepTrackablesAfterDispose = keepTrackablesAfterDispose;
        }
        this.add = this.track = this.mop;
    }

    addEventListener(element: { addEventListener: Function, removeEventListener: Function }, event: string, label: string | null = null, callback: Function, options?: AddEventListenerOptions) {
        element.addEventListener(event, callback, options);
        this.mop(() => element.removeEventListener(event, callback), label);
        return this;
    }

    on(nodeEventListener: NodeJSLikeEmitter, event: string, callback: (...args: any[]) => void, label: string | null = null) {
        nodeEventListener.on(event, callback);
        this.mop(() => nodeEventListener.off(event, callback), label);
    }

    mop<T extends SupportedJanitorTypes>(obj: T, label: string | null = null): T {
        this.#trackables.add(obj);
        if (label) {
            this.#labels.set(obj, label);
        }
        return obj;
    }

    #disposeAny(obj: SupportedJanitorTypes & { name?: string }) {

        const prefix = ">".repeat(Janitor.#level);

        Janitor.#level++;

        let total = 1;

        try {

            if (this.#labels.has(obj)) {

                this.#log(`${prefix} ${this.#labels.get(obj)}`, JanitorLogLevel.Verbose);
                this.#labels.delete(obj);

            }

            if (isObject3DLike(obj)) {

                this.#log(`${prefix} ${obj.type ?? ""} ${obj.name ?? ""}`, JanitorLogLevel.Verbose);

                disposeMesh(obj, (message: string) => this.#log(`${prefix} ${message}`, JanitorLogLevel.Debug));

                if (obj.children) {

                    const children = [...obj.children];

                    obj.clear && obj.clear();

                    for (const child of children) {
                        total += this.#disposeAny(child);
                    }
                }


            } else if (obj?.name) {

                this.#log(`${prefix} ${obj.name}`, JanitorLogLevel.Verbose);

            }

            if ("dispose" in obj) {
                obj.dispose()
            } else if (typeof obj === "function") {
                obj();
            } else if ("remove" in obj) {
                obj.remove();
            } else if (isIterable(obj)) {
                for (const o of obj) {
                    total += this.#disposeAny(o);
                }
            } else {
                this.logger.warn("Unsupported type", obj);
            }

        } catch (e) {

            this.logger.error(withErrorMessage(e, "Error disposing object"));

        }

        Janitor.#level--;

        return total;

    }

    dispose(...objects: SupportedJanitorTypes[]) {


        if (objects.length === 0) {

            if (this.#trackables.size) {

                const prefix = "+".repeat(Janitor.#level);

                if (this.#label !== null) {

                    this.#log(`${prefix} ${this.#label ?? ""} - ${this.#trackables.size} objects`, JanitorLogLevel.Info);

                }

                const total = this.#disposeAny(this.#trackables);

                if (total > 1) {

                    this.#log(`${prefix} ${this.#label ?? ""} - ${total - 1} objects disposed`, JanitorLogLevel.Info);

                }

            }

            if (!this.#keepTrackablesAfterDispose) {

                this.#trackables.clear();

            }

        } else {

            const prefix = "!".repeat(Janitor.#level);

            this.#log(`${prefix} ${this.#label ?? ""} ${objects.length} objects`, JanitorLogLevel.Info);

            const total = this.#disposeAny(objects);

            if (total > 1) {

                this.#log(`${prefix} ${this.#label ?? ""} - ${total - 1} objects disposed`, JanitorLogLevel.Info);

            }

        }


    }

    static trash(_label: string | SupportedJanitorTypes, ...objects: SupportedJanitorTypes[]) {

        const label = typeof _label === "string" ? _label : null;

        const janitor = new Janitor(label);

        if (typeof _label !== "string") {

            objects.push(_label);

        }

        janitor.dispose(...objects);

        return janitor;

    }

}

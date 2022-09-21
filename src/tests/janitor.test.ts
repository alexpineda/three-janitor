import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Object3D } from "three";
import { Janitor } from "..";
import { disposeMesh } from "../dispose-mesh";

jest.mock("../dispose-mesh", () => ({ disposeMesh: jest.fn() }));

beforeEach(() => {
    jest.clearAllMocks();
});

describe("janitor", () => {

    it("should clear objects after dispose", () => {

        const janitor = new Janitor();

        const object = { dispose: jest.fn() };

        janitor.mop(object);

        janitor.dispose();

        janitor.dispose();

        expect(object.dispose).toHaveBeenCalledTimes(1)

    });

    it("should not clear objects after dispose if keepTrackablesAfterDispose flag is on", () => {

        const janitor = new Janitor(true);

        const object = { dispose: jest.fn() };

        janitor.mop(object);

        janitor.dispose();

        janitor.dispose();

        expect(object.dispose).toHaveBeenCalledTimes(2)

    });

    it("should call Disposable.dispose() on dispose", () => {

        const janitor = new Janitor();

        const disposable = { dispose: jest.fn() };

        janitor.mop(disposable);

        janitor.dispose();

        expect(disposable.dispose).toHaveBeenCalledTimes(1);

    });

    it("should call callback on dispose", () => {

        const janitor = new Janitor();

        const callback = jest.fn();

        janitor.mop(callback);

        janitor.dispose();

        expect(callback).toHaveBeenCalledTimes(1);

    });

    it("should call HTMLElement.remove on dispose", () => {

        const janitor = new Janitor();

        const element = document.createElement("div");
        element.remove = jest.fn();

        janitor.mop(element);

        janitor.dispose();

        expect(element.remove).toHaveBeenCalledTimes(1);

    });

    it("should call disposeMesh(obj3d) on dispose", () => {

        const janitor = new Janitor();

        const obj3d = new Object3D();


        janitor.mop(obj3d);

        janitor.dispose();

        expect(disposeMesh).toHaveBeenCalledTimes(1);

    });

    it("should also call dispose on Object3D if existing", () => {

        const janitor = new Janitor();

        class ExtObj extends Object3D {
            dispose() {

            }
        };

        const obj3d = new ExtObj();

        const dispose = jest.spyOn(obj3d, "dispose");

        janitor.mop(obj3d);

        janitor.dispose();

        expect(disposeMesh).toHaveBeenCalledTimes(1);
        expect(dispose).toHaveBeenCalledTimes(1);

    });

    it("should call dispose on iterables", () => {

        const janitor = new Janitor();

        const iterables = [jest.fn(), jest.fn(), { dispose: jest.fn() }] as const;

        janitor.mop(iterables);

        janitor.dispose();

        expect(iterables[0]).toHaveBeenCalledTimes(1);
        expect(iterables[1]).toHaveBeenCalledTimes(1);
        expect(iterables[2].dispose).toHaveBeenCalledTimes(1);

    });

    it("should call dispose on nested iterables", () => {

        const janitor = new Janitor();

        const iterables = [[[[jest.fn()]]]] as const;

        janitor.mop(iterables);

        janitor.dispose();

        expect(iterables[0][0][0][0]).toHaveBeenCalledTimes(1);

    });

    it("trash should call janitor.dispose with the objects provided", () => {


        const [obj1, obj2, obj3] = [jest.fn(), jest.fn(), jest.fn()];

        Janitor.trash(obj1, obj2, obj3);

        expect(obj1).toHaveBeenCalledTimes(1);
        expect(obj2).toHaveBeenCalledTimes(1);
        expect(obj3).toHaveBeenCalledTimes(1);

    });


});
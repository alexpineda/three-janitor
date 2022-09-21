import { describe, it, expect, jest } from "@jest/globals";
import { Material, Texture } from "three";
import { disposeMesh } from '../dispose-mesh';

const textureTypes = [
    "map",
    "normalMap",
    "bumpMap",
    "displacementMap",
    "roughnessMap",
    "emissiveMap",
];

describe("disposeMesh", () => {

    it("should dispose geometry", () => {
        const dispose = jest.fn();
        const mesh = { geometry: { dispose } };
        disposeMesh(mesh as any);
        expect(dispose).toHaveBeenCalled();
        expect(mesh.geometry).toBeUndefined();
    });

    it("should dispose material", () => {
        const dispose = jest.fn();
        const material = new Material()
        material.dispose = dispose;
        const mesh = { material } as any;
        disposeMesh(mesh);
        expect(dispose).toHaveBeenCalled();
    });

    it("should dispose material(s)", () => {
        const disposeFns = [jest.fn(), jest.fn()];
        const material = [new Material(), new Material()];
        material.forEach((m, i) => m.dispose = disposeFns[i]);
        const mesh = { material } as any;
        disposeMesh(mesh);
        for (const dispose of disposeFns) {
            expect(dispose).toHaveBeenCalled();
        }
    });

    it("should dispose each texture type of material", () => {

        const disposeFns = new Array(textureTypes.length).fill(0).map(() => jest.fn());
        const material = new Material();
        textureTypes.forEach((textureType, i) => {
            material[textureType] = new Texture();
            material[textureType].dispose = disposeFns[i];
        });
        const mesh = { material } as any;
        disposeMesh(mesh);
        for (const dispose of disposeFns) {
            expect(dispose).toHaveBeenCalled();
        }
    });

    it("should dispose each texture type of material(s)", () => {

        const disposeFns = new Array(textureTypes.length).fill(0).map(() => jest.fn())
        const material = [new Material()]
        textureTypes.forEach((textureType, i) => {
            material[0][textureType] = new Texture();
            material[0][textureType].dispose = disposeFns[i];
        });
        const mesh = { material } as any;
        disposeMesh(mesh);
        for (const dispose of disposeFns) {
            expect(dispose).toHaveBeenCalled();
        }
    });
});
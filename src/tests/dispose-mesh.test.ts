import { describe, it, expect, jest } from "@jest/globals";
import { Material, MeshPhysicalMaterial, Texture } from "three";
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

    it("should dispose uniform textures", () => {

        const dispose = jest.fn();
        class UniformMaterial extends Material {
            uniforms = {
                map: { value: new Texture() },
            }
        }
        const material = new UniformMaterial();
        material.uniforms.map.value.dispose = dispose;
        const mesh = { material } as any;
        disposeMesh(mesh);
        expect(dispose).toHaveBeenCalled();
    });

    it("should dispose each texture type of MeshPhysicalMaterial", () => {

        const disposeFns: Function[] = [];
        const callback = () => {
            const fn = jest.fn();
            disposeFns.push(fn);
            return fn;
        }
        const material = new MeshPhysicalMaterial();
        material.alphaMap = new Texture();
        material.alphaMap.dispose = callback();
        material.aoMap = new Texture();
        material.aoMap.dispose = callback();
        material.bumpMap = new Texture();
        material.bumpMap.dispose = callback();
        material.clearcoatMap = new Texture();
        material.clearcoatMap.dispose = callback();;
        material.clearcoatRoughnessMap = new Texture();
        material.clearcoatRoughnessMap.dispose = callback();
        material.clearcoatNormalMap = new Texture();
        material.clearcoatNormalMap.dispose = callback();
        material.displacementMap = new Texture();
        material.displacementMap.dispose = callback();
        material.envMap = new Texture();
        material.envMap.dispose = callback();
        material.emissiveMap = new Texture();
        material.emissiveMap.dispose = callback();
        material.lightMap = new Texture();
        material.lightMap.dispose = callback();
        material.map = new Texture();
        material.map.dispose = callback();
        material.metalnessMap = new Texture();
        material.metalnessMap.dispose = callback();
        material.normalMap = new Texture();
        material.normalMap.dispose = callback();
        material.roughnessMap = new Texture();
        material.roughnessMap.dispose = callback();
        material.sheenRoughnessMap = new Texture();
        material.sheenRoughnessMap.dispose = callback();
        material.sheenColorMap = new Texture();
        material.sheenColorMap.dispose = callback();
        material.thicknessMap = new Texture();
        material.thicknessMap.dispose = callback();
        material.transmissionMap = new Texture();
        material.transmissionMap.dispose = callback();

        const mesh = { material } as any;
        disposeMesh(mesh);
        for (const dispose of disposeFns) {
            expect(dispose).toHaveBeenCalled();
        }
    });
});
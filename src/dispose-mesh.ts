import { Object3D, Material, Texture, BufferGeometry } from "three";


// Some Three objects like Point are not Object3D
export type Object3DLike = {
    name: string;
    type?: string;
    material?: Material | Material[],
    geometry?: BufferGeometry,
    children?: Object3D[],
    clear?: () => void,
}

const disposeMaterial = (material: Material & { uniforms?: Record<string, any> }) => {

    for (const key of Object.keys(material)) {
        if (material[key] instanceof Texture && typeof material[key].dispose === "function") {
            material[key as keyof typeof material].dispose();
        }
    }

    if (material.uniforms && typeof material.uniforms === "object") {
        for (const key of Object.keys(material.uniforms)) {
            const uniform = material.uniforms[key]?.value;
            if (uniform instanceof Texture && typeof uniform.dispose === "function") {
                uniform.dispose();
            }
        }
    }

    material.dispose();

}

export const disposeMesh = (mesh: Object3DLike, log: (message: string) => void = () => { }) => {

    try {

        if (
            mesh.material instanceof Material
        ) {

            disposeMaterial(mesh.material);

        } else if (Array.isArray(mesh.material)) {

            for (const material of mesh.material) {


                disposeMaterial(material);

            }

        }

    } catch (e) {
        console.error("error disposing map", e);
    }

    try {

        if (mesh.geometry) {

            mesh.geometry.dispose();
            log(`geometry ${mesh.geometry.name}`);
            mesh.geometry = undefined;

        }
    } catch (e) {

        console.error("error disposing geometry", e);

    }

};
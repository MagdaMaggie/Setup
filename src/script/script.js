import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js';
//import { PMREMGenerator } from 'https://unpkg.com/three@0.146.0/examples/jsm/pmrem/PMREMGenerator.js';
import { gsap } from 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';

document.addEventListener("DOMContentLoaded", () => {
    const fraesenUrl = new URL('../assets/7.glb', import.meta.url).href;
    const canvas = document.querySelector('canvas.webgl');
    const scene = new THREE.Scene();
    const sizes = { width: window.innerWidth, height: window.innerHeight };

    let model = null;
    let mixer = null;

    const loadModel = () => {
        return new Promise((resolve, reject) => {
            const gLTFLoader = new GLTFLoader();
            gLTFLoader.load(fraesenUrl, (gltf) => {
                model = gltf.scene;
                model.position.set(2.5, -0.5, 0);
                model.rotation.set(Math.PI * 0.1, Math.PI * 1.2, 0);
                model.scale.set(1, 1, 1);

                model.traverse((child) => {
                    if (child.isMesh && child.material.map) {
                        child.material.map.encoding = THREE.sRGBEncoding;
                    }
                });

                scene.add(model);
                mixer = new THREE.AnimationMixer(model);

                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });

                resolve();
            }, undefined, reject);
        });
    };

    const setupCameraAndLights = () => {
        const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);
        camera.position.z = 5;
        scene.add(camera);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 2, 0);
        scene.add(directionalLight);

        return camera;
    };

    const setupRenderer = () => {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });

        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.6;
        renderer.outputEncoding = THREE.sRGBEncoding;

        return renderer;
    };

    const loadHDR = () => {
        return new Promise((resolve, reject) => {
            const hdrUrls = ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'];
            const pmremGenerator = new PMREMGenerator(renderer);
            pmremGenerator.compileCubemapShader();

            new HDRCubeTextureLoader()
                .setPath('../assets/CubeHdr/')
                .load(hdrUrls, (hdrCubeMap) => {
                    const hdrCubeRenderTarget = pmremGenerator.fromCubemap(hdrCubeMap);
                    hdrCubeMap.magFilter = THREE.LinearFilter;
                    hdrCubeMap.needsUpdate = true;

                    scene.background = hdrCubeRenderTarget.texture;
                    scene.environment = hdrCubeRenderTarget.texture;

                    resolve();
                }, undefined, (error) => {
                    console.error('An error happened while loading the HDR textures', error);
                    reject(error);
                });
        });
    };

    const animate = (renderer, camera) => {
        const clock = new THREE.Clock();
        let lastElapsedTime = 0;

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            const deltaTime = elapsedTime - lastElapsedTime;
            lastElapsedTime = elapsedTime;

            if (mixer) {
                mixer.update(deltaTime);
            }

            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        };

        tick();
    };

    const handleScroll = () => {
        const transformModel = [
            { rotationZ: 0, positionX: 2.5 },
            { rotationZ: 0, positionX: -1.3 },
            { rotationZ: 0, positionX: 2.5 },
            { rotationZ: 0, positionX: -1.3 },
            { rotationZ: 0, positionX: 2.5 },
            { rotationZ: 0, positionX: -1.3 },
            { rotationZ: 0, positionX: 2.5 },
            { rotationZ: 0, positionX: 0 }
        ];

        let currentSection = 0;

        window.addEventListener('scroll', () => {
            const newSection = Math.round(window.scrollY / sizes.height);

            if (newSection !== currentSection) {
                currentSection = newSection;

                if (model && transformModel[currentSection]) {
                    gsap.to(model.rotation, {
                        duration: 1.25,
                        ease: 'power2.inOut',
                        z: transformModel[currentSection].rotationZ
                    });
                    gsap.to(model.position, {
                        duration: 1.25,
                        ease: 'power2.inOut',
                        x: transformModel[currentSection].positionX
                    });
                }
            }
        });
    };

    const resetScrollOnUnload = () => {
        window.onbeforeunload = () => window.scrollTo(0, 0);
    };

    // Initialize
    (async () => {
        const camera = setupCameraAndLights();
        const renderer = setupRenderer();
        await Promise.all([loadHDR(), loadModel()]);
        animate(renderer, camera);
        handleScroll();
        resetScrollOnUnload();
    })();
});

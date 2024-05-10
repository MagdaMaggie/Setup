import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import nebula from './img/nebula.jpg';

const fraesenUrl = new URL('./assets/1+Press.glb', import.meta.url);

const renderer = new THREE.WebGLRenderer();

renderer.shadowMap.enabled=true;

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45, 
    window.innerWidth/window.innerHeight,
    0.1,   //near
    1000   //far
);

const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(-10, 30, 30);  //x, y, z Achsenpositionen
orbit.update();

// const boxGeometry = new THREE.BoxGeometry();
// const boxMaterial = new THREE.MeshBasicMaterial({color:0x00FF00});
// const box = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(box);

// const planeGeometry = new THREE.PlaneGeometry(30, 30);
// const planeMaterial= new THREE.MeshStandardMaterial({color: 0xFFFFFF, side: THREE.DoubleSide});
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// scene.add(plane);
// plane.rotation.x= -0.5*Math.PI;
// plane.receiveShadow=true;

const gridHelper= new THREE.GridHelper(30);  //(size, amount of Kästchen)
scene.add(gridHelper);

// const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);   //width, height == number of segments
// const sphereMaterial = new THREE.MeshStandardMaterial({color: 0x0000FF, wireframe: false});
// const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// scene.add(sphere);
// sphere.castShadow=true;
// sphere.position.set(-10, 10, 0);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
scene.add(directionalLight);
directionalLight.position.set(-30, 50, 0);
directionalLight.castShadow=true;
directionalLight.shadow.camera.bottom=-12;

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(dLightHelper);

const dLightShadowHelper= new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);

// const spotLight = new THREE.SpotLight(0xFFFFFF);
// scene.add(spotLight);
// spotLight.position.set(-100, 100, 0);
// spotLight.castShadow=true;
// spotLight.angle=0.2;

// const sLightHelper=new THREE.SpotLightHelper(spotLight);
// scene.add(sLightHelper);

//scene.fog = new THREE.Fog(0xFFFFFF, 0, 200); //color, near, far
// scene.fog =new THREE.FogExp2(0xFFFFFF, 0.01);

//renderer.setClearColor(0xFFEA00);

const textureLoader = new THREE.TextureLoader();
scene.background= textureLoader.load(nebula);
// const cubeTextureLoader = new THREE.CubeTextureLoader();
// scene.background=cubeTextureLoader.load([
//     nebula,
//     nebula,
//     nebula,
//     nebula,
//     nebula,
//     nebula
// ]);

// const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
// const box2Material = new THREE.MeshBasicMaterial({
//     //color: 0x00FF00, 
//     //map: textureLoader.load(nebula)
// });
// const box2MultiMaterial = [
//     new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
//     new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
//     new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
//     new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
//     new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
//     new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)})
// ]
// const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);
// scene.add(box2);
// box2.position.set(0, 15, 10);
//box2.material.map = textureLoader.load(nebula);

const assetLoader=new GLTFLoader();

let mixer;
assetLoader.load(fraesenUrl.href, function(gltf){
    const model = gltf.scene;
    scene.add(model);
    model.position.set(0, 0.2, 0);
    mixer=new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    // const clip = THREE.AnimationClip.findByName(clips, 'Press');
    // const action = mixer.clipAction(clip);
    // action.play();
    clips.forEach(function(clip){
        const action = mixer.clipAction(clip);
        action.play();
    })
}, undefined, function(error){
    console.error(error);
});

// const giu = new dat.GUI();
// const options= {
//     sphereColor: '#ffea00',
//     wireframe: false,
//     speed:0.01, 
//     angle:0.2,
//     penumbra: 0,
//     intensity: 1
// };
// giu.addColor(options, 'sphereColor').onChange(function(e){
//     sphere.material.color.set(e);
// });
// giu.add(options, 'wireframe').onChange(function(e){
//     sphere.material.wireframe=e;
// });
// giu.add(options, 'speed', 0, 0.1);
// giu.add(options, 'angle', 0, 1);
// giu.add(options, 'penumbra', 0, 1);
// giu.add(options, 'intensity', 0, 1);

let step=0;

const clock = new THREE.Clock();

function animate(){
    // box.rotation.x+= 0.1;
    // box.rotation.y+= 0.1;

    // step +=options.speed;   
    // sphere.position.y=10*Math.abs(Math.sin(step));

    // spotLight.angle=options.angle;
    // spotLight.penumbra=options.penumbra;
    // spotLight.intensity=options.intensity;
    // sLightHelper.update();


    if (mixer) {
        mixer.update(clock.getDelta());
    }

    renderer.render(scene, camera);    //link scene and camera
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/this.window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

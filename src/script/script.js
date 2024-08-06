document.addEventListener("load", ()=>{
    const fraesenUrl = new URL('../assets/7.glb', import.meta.url).href; 

    const canvas = document.querySelector('canvas.webgl');
    const scene = new THREE.Scene();

    // new RGBELoader().load('../assets/environment.hdr', (texture)=> {
    // texture.mapping=THREE.EquirectangularReflectionMapping;
    // scene.background=texture;
    // scene.environment=texture;
    // })

    let hdrCubeMap;

    let model = null;
    const gLTFLoader = new THREE.GLTFLoader();
    let mixer;
    gLTFLoader.load(fraesenUrl, (gltf) => {
        model = gltf.scene;
        console.log(gltf);
    
        model.position.x = 2.5;
        model.position.y = -0.5;
        model.rotation.x = Math.PI * 0.1;
        model.rotation.y = Math.PI * 1.2;
    
        const radius = 1;
        model.scale.set(radius, radius, radius);
    
        model.traverse((child) => {
            if (child.isMesh && child.material.map) {
                child.material.map.encoding = THREE.sRGBEncoding;
            }
        });
    
        scene.add(model);
    
        mixer = new THREE.AnimationMixer(model);
        const clips = gltf.animations;
        const clip = THREE.AnimationClip.findByName(clips, 'Press');
        const action = mixer.clipAction(clip);
        action.play();
        clips.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        });
    }, undefined, (error) => {
        console.error(error);
    });
    const transformModel=[
        {
        rotationZ: 0,
        positionX:2.5
        }, {
        rotationZ: 0,
        positionX: -1.3
        }, {
        rotationZ: 0,
        positionX: 2.5
        }, {
        rotationZ: 0,
        positionX: -1.3
        }, {
        rotationZ: 0,
        positionX:2.5
        }, {
        rotationZ: 0,
        positionX: -1.3
        }, {
        rotationZ: 0,
        positionX:2.5
        }, {
        rotationZ: 0,
        positionX: 0
        }
        ]
    
    let scrollY=window.scrollY
    let currentSection=0
    window.addEventListener('scroll', ()=>{
    scrollY=window.scrollY
    const newSection = Math.round(scrollY/sizes.height)
    console.log("New section: ${newSection}");
    
    if(newSection!= currentSection){
        currentSection=newSection
    
        if(model && transformModel[currentSection]){
            console.log(`Applying transformations for section ${currentSection}`);
            console.log(`Position X: ${transformModel[currentSection].positionX}`);
    
            gsap.to(
                model.rotation, {
                    duration: 1.25,
                    ease: 'power2.inOut',
                    z: transformModel[currentSection].rotationZ
                }
            );
            gsap.to(
                model.position, {
                    duration: 1.25,
                    ease: 'power2.inOut',
                    x:transformModel[currentSection].positionX
                }
            )
        }
    }
    })
    
    window.onbeforeunload=function(){
        window.scrollTo(0,0)
        }
    
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);
    camera.position.z = 5;
    scene.add(camera);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 2, 0);
    scene.add(directionalLight);
    
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
    
    const clock = new THREE.Clock();
    let lastElapsedTime = 0;
    
    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - lastElapsedTime;
        lastElapsedTime = elapsedTime;
    
        if (mixer && currentSection === 1) {
            mixer.update(deltaTime);
        }
    
        const hdrUrls = ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'];
        hdrCubeMap = new HDRCubeTextureLoader()
            .setPath('../assets/CubeHdr/')
            .load(hdrUrls, function () {
                hdrCubeRenderTarget = pmremGenerator.fromCubemap(hdrCubeMap);
                hdrCubeMap.magFilter = THREE.LinearFilter;
                hdrCubeMap.needsUpdate = true;
            });
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileCubemapShader();
    
        scene.background = hdrCubeMap;
        renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
    };   

    animate();
})






import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/examples/jsm/Addons.js'
import { EXRLoader } from 'three/examples/jsm/Addons.js'
import { TextureLoader } from 'three'
import { GroundProjectedSkybox } from 'three/examples/jsm/Addons.js'



// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const rgbeLoader = new RGBELoader()
const exrLoader = new EXRLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()
// const groundedSkybox = new GroundProjectedSkybox()

// console.log(groundedSkybox)





/**
 * Base
 */
// Debug
const gui = new GUI()
const global = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Update all materials
const updateMaterialss = ()=>{
    scene.traverse((child)=>{
        if(child.isMesh && child.material.isMeshStandardMaterial){

            child.material.envMapIntensity = global.envMapIntensity
        }
    })
}

// Environment Map
// scene.backgroundBlurriness = 0
// scene.backgroundIntensity = 1
// // global intensity
global.envMapIntensity = 1
gui.add(global, 'envMapIntensity').min(0).max(10).step(.001).onChange(updateMaterialss)
// gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(.001)
// gui.add(scene, 'backgroundIntensity').min(0).max(10).step(.001)
// // LDR cube texture
// const environmentMap = cubeTextureLoader.load([
//     'environmentMaps/0/px.png',
//     'environmentMaps/0/nx.png',
//     'environmentMaps/0/py.png',
//     'environmentMaps/0/ny.png',
//     'environmentMaps/0/pz.png',
//     'environmentMaps/0/nz.png'
// ])
// scene.environment = environmentMap
// scene.background = environmentMap


// HDRI equirectangular map
// const environmentMap = rgbeLoader.load(
//     '/environmentMaps/blender-2k.hdr',
//     (environment)=>{
//         environment.mapping = THREE.EquirectangularReflectionMapping
//         // scene.background ˝= environment
//         scene.environment = environment
//         console.log(environment)
//     }
// )

// HDRI EXR equirectangular map
// const environmentMap = exrLoader.load(
//     '/environmentMaps/nvidiaCanvas-4k.exr',
//     (environment)=>{
//         environment.mapping = THREE.EquirectangularReflectionMapping
//         scene.background = environment
//         scene.environment = environment
//     }
// )

// LDR equirectangular map 
// const environmentMap = textureLoader.load(
//         '/environmentMaps/blockadesLabsSkybox/digital_painting_neon_city_night_orange_lights_.jpg',
//         (environment)=>{
//             environment.mapping = THREE.EquirectangularReflectionMapping
//             scene.background = environment
//             scene.environment = environment
//         }
//     )
// environmentMap.colorSpace = THREE.SRGBColorSpace
// global.envMapIntensity = 4

// skybox ground projection
// const environmentMap = rgbeLoader.load(
//     '/environmentMaps/2/2k.hdr',
//     (environment)=>{
//         environment.mapping = THREE.EquirectangularReflectionMapping
//         //  scene.background = environment
//         scene.environment = environment
//         // console.log(environment)
//         const skybox = new GroundProjectedSkybox(environment)
//         skybox.radius = 120
//         skybox.height = 11
//         skybox.scale.setScalar(50)
//         scene.add(skybox)

//         gui.add(skybox, 'radius', 1, 200, .1).name('skyboxRadius')
//         gui.add(skybox, 'height', 1, 200, .1).name('skyboxHeight')
//     }
// )

// Real time environment map
// base environment map
const environmentMap = textureLoader.load(
        '/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg',
        (environment)=>{
            environment.mapping = THREE.EquirectangularReflectionMapping
            environmentMap.colorSpace = THREE.SRGBColorSpace
            scene.background = environment
            // scene.environment = environment
        }
    )


/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({ roughness: .3, metalness: 1, color: 0xaaaaaa})
)
torusKnot.position.x = - 6
torusKnot.position.y = 4
// scene.add(torusKnot)

// Holy donut
const holyDonut = new THREE.Mesh(
    new THREE.TorusGeometry(6, .3),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 4, 2)})
)
holyDonut.position.y = 3.5
scene.add(holyDonut)
holyDonut.layers.enable(1)

// Cube Render Target
const cubeRender = new THREE.WebGLCubeRenderTarget(
    256,
    {
        type: THREE.HalfFloatType
    }
)
scene.environment = cubeRender.texture

// Cube Camera
const cubeCamera = new THREE.CubeCamera(.1, 100, cubeRender)
cubeCamera.layers.set(1)

// Models
let model = null
gltfLoader.load(
    '/models/mercedez-logo.glb',
    (gltf)=>{
        gltf.scene.rotation.x = Math.PI / 2
        gltf.scene.position.y = 3
        model = gltf.scene
        scene.add(model)
        console.log('success')
        updateMaterialss()
    }
)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Time
    const elapsedTime = clock.getElapsedTime()
    // Model update
    if (model) {
        // model.rotation.z += .05
    }
// Update real time environemnt map
if (holyDonut) {
    holyDonut.rotation.x = Math.sin(elapsedTime) * 2
    cubeCamera.update(renderer, scene)
}

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
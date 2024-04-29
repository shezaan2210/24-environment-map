import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/examples/jsm/Addons.js'


// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const rgbeLoader = new RGBELoader()

const cubeTextureLoader = new THREE.CubeTextureLoader()




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
const environmentMap = rgbeLoader.load(
    '/environmentMaps/blender-2k.hdr',
    (environment)=>{
        environment.mapping = THREE.EquirectangularReflectionMapping
        scene.background = environment
        scene.environment = environment
        console.log(environment)
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
scene.add(torusKnot)

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
    if (model === null) {
        
    }
    else{

        model.rotation.z += .05
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
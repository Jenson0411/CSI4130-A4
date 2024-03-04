import * as THREE from 'three';
import { GUI } from 'dat.gui';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 12);
camera.lookAt(0, 0, 0);


// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xADD8E6);

// Create a top of the snowglobe
const radius = 4;
const theta = -Math.PI / 4;
const textureLoader = new THREE.TextureLoader();
const snowTexture = textureLoader.load("textures/snowwall.jpg")
const topGeometry = new THREE.SphereGeometry(radius, 64, 64, 0, Math.PI * 2, theta, Math.PI);
const glassMaterial = new THREE.MeshPhysicalMaterial({
    roughness : 0,
    metalness: 0,
    transmission: 1,
});

const top = new THREE.Mesh(topGeometry, glassMaterial);
scene.add(top);

// Calculation for spherical cap radius(basic trigonometry)
const baseRadius = radius * Math.sin(Math.abs(theta));


// Create base of snowglobe
const woodTexture = textureLoader.load("textures/OIP.jpg")

const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius*1.5, 2);
const baseMaterial = new THREE.MeshBasicMaterial({ map : woodTexture});
const base = new THREE.Mesh(baseGeometry, baseMaterial);
scene.add(base);
base.position.set(0, -radius, 0);

// Ambient lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const shakingVariables = {
    speed : 1,
    animationFrames : 100

}

//Dat Slider
const gui = new GUI();
gui.addFolder("Shaking Controls");
var shakeAnimationFolder = gui.addFolder('Shaking Setting');
shakeAnimationFolder.add(shakingVariables, 'speed', 0, 3, 0.1).name("Speed");
shakeAnimationFolder.add(shakingVariables, 'animationFrames', 0, 500, 1).name("Animation Frame");
shakeAnimationFolder.open();

gui.add({'Shake Animation': shakeAnimation}, 'Shake Animation').name("Shake Animation");



function shakeAnimation(){
    t = 0;
}


var t = 100;
var animationFrames = 100
var speed = 1;

var shakingDirection = "U";
// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    if(t<shakingVariables.animationFrames){
        if(shakingDirection=="D"){
            top.position.y = top.position.y - 0.5 *shakingVariables.speed;
            base.position.y = base.position.y -0.5 * shakingVariables.speed;
            
        }
        else if(shakingDirection =="U"){
            top.position.y = top.position.y + 0.5 *shakingVariables.speed;
            base.position.y = base.position.y + 0.5*shakingVariables.speed;

        }

        if(top.position.y < -0.5 && shakingDirection == "D"){
            shakingDirection = "U";
        }
        else if(top.position.y > 0.5 && shakingDirection == "U"){
            shakingDirection = "D";
        }
        t = t + 1;
    }    

}
animate();

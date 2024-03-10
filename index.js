import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

var t = 100;
var animationFrames = 100;
var speed = 1;
var shakingDirection = "U";

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const shakingVariables = {
    speed : 1,
    animationFrames : 100
};

function shakeAnimation(){
    t = 0;
}

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xADD8E6);

// Create a top of the snowglobe
const radius = 6;
const theta = -Math.PI / 4;
const textureLoader = new THREE.TextureLoader();
const topGeometry = new THREE.SphereGeometry(radius, 64, 64, 0, Math.PI * 2, theta, Math.PI);
const glassMaterial = new THREE.MeshPhysicalMaterial({
    roughness : 0,
    metalness: 0,
    transmission: 1,
    transparent: 1
});
const top = new THREE.Mesh(topGeometry, glassMaterial);
scene.add(top);

// Setting up camera
camera.position.set(0, 0, 12); 

// Calculation for spherical cap radius(basic trigonometry)
const baseRadius = radius * Math.sin(Math.abs(theta));
const capHeight = radius - radius * Math.cos(Math.abs(theta));

// Create base of snowglobe
const woodTexture = textureLoader.load("textures/OIP.jpg");
const baseHeight = 0.5;
const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight);
const baseMaterial = new THREE.MeshBasicMaterial({ map : woodTexture});
const base = new THREE.Mesh(baseGeometry, baseMaterial);
scene.add(base);
base.position.set(0, -((radius-capHeight)+baseHeight/2), 0);

const shapeGeometry = new THREE.BoxGeometry(1, 1, 1);
const shape1 = new THREE.Mesh(shapeGeometry, new THREE.MeshBasicMaterial({ color: "red"}))
const shape2 = new THREE.Mesh(shapeGeometry, new THREE.MeshBasicMaterial({ color: "blue"}))
const shape3 = new THREE.Mesh(shapeGeometry, new THREE.MeshBasicMaterial({ color: "green"}))
shape1.position.set(0,0,0);
shape2.position.set(-1,0,0);
shape3.position.set(1,0,0);
scene.add(shape1);
scene.add(shape2);
scene.add(shape3);


// Ambient lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

//Dat Slider
const gui = new GUI();
var cameraFolder = gui.addFolder('Camera Setting');
cameraFolder.add(camera.position, 'x', -200, 200, 1).name("X").onChange(camera.lookAt(top.position.x, top.position.y, top.position.z));
cameraFolder.add(camera.position, 'y', -200, 200, 1).name("Y").onChange(camera.lookAt(top.position.x, top.position.y, top.position.z));
cameraFolder.add(camera.position, 'z', -200, 200, 1).name("Z").onChange(camera.lookAt(top.position.x, top.position.y, top.position.z));
cameraFolder.open();

var shakeAnimationFolder = gui.addFolder('Shaking Setting');
shakeAnimationFolder.add(shakingVariables, 'speed', 0, 3, 0.1).name("Speed");
shakeAnimationFolder.add(shakingVariables, 'animationFrames', 0, 500, 1).name("Animation Frame");
shakeAnimationFolder.open();


gui.add({'Shake Animation': shakeAnimation}, 'Shake Animation').name("Shake Animation");

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    if(t<shakingVariables.animationFrames){
        if(shakingDirection=="D"){
            top.position.y = top.position.y - 0.25 *shakingVariables.speed;
            base.position.y = base.position.y -0.25 * shakingVariables.speed;
            
        }
        else if(shakingDirection =="U"){
            top.position.y = top.position.y + 0.25 *shakingVariables.speed;
            base.position.y = base.position.y + 0.25*shakingVariables.speed;

        }

        if(top.position.y < -1 && shakingDirection == "D"){
            shakingDirection = "U";
        }
        else if(top.position.y > 1 && shakingDirection == "U"){
            shakingDirection = "D";
        }
        t = t + 1;
    }    
    else{
        camera.lookAt(top.position.x, top.position.y, top.position.z); 
    }
}
animate();

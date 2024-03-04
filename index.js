import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xADD8E6);

// Create a sphere
const radius = 4;
const theta = -Math.PI / 4;

const geometry = new THREE.SphereGeometry(radius, 64, 64, 0, Math.PI * 2, theta, Math.PI);
const material = new THREE.MeshPhysicalMaterial({
    color: "white",
    roughness : 0,
    metalness: 0,
    transmission: 1,
});

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Calculation for cylinder position
const capRadius = radius * Math.sin(Math.abs(theta));

// Create a green cylinder
const cylinderGeometry = new THREE.CylinderGeometry(capRadius, capRadius+1, 2);
const cylinderMaterial = new THREE.MeshBasicMaterial({ color: "green" });
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
scene.add(cylinder);

// Set position of the cylinder
cylinder.position.set(0, -radius, 0);

// Set camera position and orientation
camera.position.set(0, 0, 12);
camera.lookAt(0, 0, 0);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
var shakingDirection = "L"
// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    if(shakingDirection=="L"){
         sphere.position.x = sphere.position.x - 0.5;
         cylinder.position.x = cylinder.position.x -0.5;
         count=  count+1;
    }
    else if(shakingDirection =="R"){
        sphere.position.x = sphere.position.x + 0.5;
        cylinder.position.x = cylinder.position.x + 0.5;
        count=  count+1;
   }

   if(sphere.position.x < -3 && shakingDirection == "L"){
       shakingDirection = "R";
   }
   else if(sphere.position.x > 3 && shakingDirection == "R"){
       shakingDirection = "L";
   }

}
animate();

import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

var t = 100;
var animationFrames = 100;
var speed = 1;
var shakingDirection = "U";
var shakeState = false;
var snowfallStarted = false;
var snowfallTimer = 0;
const snowfallDuration = 10;
var deathCounter = 0
var count = 0;
var flag2 = true;

// Create snow particles
const particleCount = 500;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3); // 3 values per vertex (x, y, z)
const velocities = new Float32Array(particleCount * 3); // 3 values per velocity (vx, vy, vz)
const deaths = new Float32Array(particleCount);
const state = new Float32Array(particleCount);
const gravity = new THREE.Vector3(0, -0.005, 0); // Adjust gravity as needed

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Setting up camera
camera.position.set(0, 0, 12);

const shakingVariables = {
    speed: 1,
    animationFrames: 100
};


// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xADD8E6);


// Create a top of the snowglobe
const radius = 6;
const theta = -Math.PI / 4;
const textureLoader = new THREE.TextureLoader();
const snowflakeTexture = textureLoader.load('textures/snowflake.png');

const topGeometry = new THREE.SphereGeometry(radius, 64, 64, 0, Math.PI * 2, theta, Math.PI);
const glassMaterial = new THREE.MeshPhysicalMaterial({
    roughness: 0,
    metalness: 0,
    transmission: 1,
    transparent: 1
});
const top = new THREE.Mesh(topGeometry, glassMaterial);
scene.add(top);


// Calculation for spherical cap radius(basic trigonometry)
const baseRadius = radius * Math.sin(Math.abs(theta));
const capHeight = radius - radius * Math.cos(Math.abs(theta));

// Create base of snowglobe
const woodTexture = textureLoader.load("textures/OIP.jpg");
const baseHeight = 0.5;
const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight);
const baseMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
const base = new THREE.Mesh(baseGeometry, baseMaterial);
scene.add(base);
base.position.set(0, -((radius - capHeight) + baseHeight / 2), 0);

// creating the snow layer on ground
const snowGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, 0.000000000000001);
const snowMaterial = new THREE.MeshBasicMaterial({color: 'white'})
const snowLayer =  new THREE.Mesh(snowGeometry, snowMaterial)
snowLayer.position.set(0, -((radius - capHeight +0.000000000000001/2)), 0);
scene.add(snowLayer);

//Creating the base of the christmas tree
const treeBaseGeometry = new THREE.CylinderGeometry(1, 1, 3);
const treeBaseMaterial = new THREE.MeshBasicMaterial({color: 'brown'})
const treeBase =  new THREE.Mesh(treeBaseGeometry, treeBaseMaterial);
treeBase.position.set(0, -((radius - capHeight)) + 3/2, 0);
scene.add(treeBase);

// Creating the top of the christmas tree
const treeHeight = 3
const treeCones = new THREE.ConeGeometry(2, 3);
const treeConeMaterial = new THREE.MeshBasicMaterial({color: 'green'})
const treeCone1 =  new THREE.Mesh(treeCones, treeConeMaterial);
treeCone1.position.set(0, treeBase.position.y+ 3/2 , 0);
const treeCone2 =  new THREE.Mesh(treeCones, treeConeMaterial);
treeCone2.position.set(0, treeCone1.position.y+ 3/2 , 0);
const treeCone3 =  new THREE.Mesh(treeCones, treeConeMaterial);
treeCone3.position.set(0, treeCone2.position.y+ 3/2 , 0);
scene.add(treeCone1);
scene.add(treeCone2);
scene.add(treeCone3);


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

gui.add({ 'Shake Animation': shakeAnimation }, 'Shake Animation').name("Shake Animation");

// Initialize velocity, position and states of each particle
function particleSystemInit(){
    for (let i = 0; i < particleCount; i++) {
        let coord = generateRandomPointInsideSphere();

        const y = coord[1]
        const x = coord[0]
        const z = coord[2]
        const vx = Math.random() * 0.02 - 0.01 // Random velocity in x direction
        const vy = Math.random() * 0.02 - 0.01; // Random velocity in y direction
        const vz = Math.random() * 0.02 -0.01; // Random velocity in z direction

        // Set particle position
        positions[i * 3] = x;
        positions[i * 3 + 1] =  y;
        positions[i * 3 + 2] = z;

        // Set particle velocity
        velocities[i * 3] = vx;
        velocities[i * 3 + 1] = vy;
        velocities[i * 3 + 2] = vz;
        
        //set particile's death counter
        deaths[i] = 0;
        state[i] = 1;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    particles.setAttribute('death', new THREE.BufferAttribute(deaths, 1));
    particles.setAttribute('state', new THREE.BufferAttribute(state, 1));

    particleSystem.geometry.attributes.position.needsUpdate = true; 
    particleSystem.geometry.attributes.velocity.needsUpdate = true; 
    particleSystem.geometry.attributes.death.needsUpdate = true;
}

const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    map: snowflakeTexture,
    transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending,
});

const particleSystem = new THREE.Points(particles, particleMaterial);




// Function to start the shaking animation
function shakeAnimation() {
    t = 0;
    shakeState = true;

    // Reset snowfall animation variables
    snowfallStarted = false;
    snowfallTimer = 0;
}



// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    if (!snowfallStarted && shakeState) {
        // Perform shaking animation
        if (t < shakingVariables.animationFrames) {
            if (shakingDirection == "D") {
                top.position.y -= 0.25 * shakingVariables.speed;
                base.position.y -= 0.25 * shakingVariables.speed;
                snowLayer.position.y -= 0.25 * shakingVariables.speed;
                treeBase.position.y -= 0.25 * shakingVariables.speed;
                treeCone1.position.y -= 0.25 * shakingVariables.speed;
                treeCone2.position.y -= 0.25 * shakingVariables.speed;
                treeCone3.position.y -= 0.25 * shakingVariables.speed;

            } else if (shakingDirection == "U") {
                top.position.y += 0.25 * shakingVariables.speed;
                base.position.y += 0.25 * shakingVariables.speed;
                snowLayer.position.y += 0.25 * shakingVariables.speed;
                treeBase.position.y += 0.25 * shakingVariables.speed;
                treeCone1.position.y += 0.25 * shakingVariables.speed;
                treeCone2.position.y += 0.25 * shakingVariables.speed;
                treeCone3.position.y += 0.25 * shakingVariables.speed;
            }

            if (top.position.y < -1 && shakingDirection == "D") {
                shakingDirection = "U";
            } else if (top.position.y > 1 && shakingDirection == "U") {
                shakingDirection = "D";
            }
            t++;
        } else {
            // Start snowfall animation after shaking animation ends
            snowfallStarted = true;
            shakeState = false; // Reset shake state
            scene.add(particleSystem); // Add snow particles to the scene
            particleSystemInit();
        }
    } else if (snowfallStarted) {
        // Snowfall animation
        if (deathCounter<particleCount) { // Convert duration to frames
            snowFalling();
        }    
         else {
            deathCounter = 0;
            // Snowfall animation ended, reset variables for the next cycle
            snowfallStarted = false;
            scene.remove(particleSystem);
            particleSystemInit();
            count = 0;
        }
    }
}



function generateRandomPointInsideSphere() {
    while(true){
        const y = Math.random()*(radius*2-capHeight)  -(radius -capHeight)
        const x = Math.random()*Math.sqrt(radius*radius-y*y)*2 -Math.sqrt(radius*radius - y*y) 
        const z = Math.random()*Math.sqrt(radius*radius-y*y)*2 -Math.sqrt(radius*radius - y*y)
        if(Math.sqrt((x- top.position.x)**2 + (y - top.position.y)**2 + (z-top.position.z)**2)<radius){
            return [x,y,z]
        }
        return [x,y,z];
    }    
}



function snowFalling(){
    const positions = particles.getAttribute('position');
    const velocities = particles.getAttribute('velocity');
    const deaths = particles.getAttribute('death');
    const states = particles.getAttribute('state');
    // Update particle positions

    console.log(states.array);
    for (let i = 0; i < particleCount; i++) {
        if(deaths.array[i] <= 20 && states.array[i] == 1){
            // Update position based on velocity
            positions.array[i * 3] += velocities.array[i * 3];
            positions.array[i * 3 + 1] += velocities.array[i * 3 + 1];
            positions.array[i * 3 + 2] += velocities.array[i * 3 + 2];

            // Apply gravity
            velocities.array[i * 3] += gravity.x;
            velocities.array[i * 3 + 1] += gravity.y;
            velocities.array[i * 3 + 2] += gravity.z;


            // Reset particle position if it goes below the ground
            if (positions.array[i * 3 + 1] < -((radius - capHeight) + baseHeight / 2) && deaths.array[i] != 21) {
                let coord = generateRandomPointInsideSphere();

                const y = coord[1]
                const x = coord[0]
                const z = coord[2]

                deaths.array[i] = deaths.array[i] +1;
                positions.array[i * 3 + 1] = y
                positions.array[i * 3] = x
                positions.array[i * 3 + 2] = z

                velocities.array[i * 3] = Math.random() * 0.02 - 0.01 // Random velocity in x direction
                velocities.array[i * 3 + 1] = Math.random() * 0.02 - 0.01 // Random velocity in x direction
                velocities.array[i * 3 + 2] = Math.random() * 0.02 - 0.01 // Random velocity in x direction


            }
            else if(Math.sqrt((positions.array[i*3] - top.position.x)**2 + (positions.array[i*3+1]- top.position.y)**2 + (positions.array[i*3+2] -  top.position.z)**2)>radius && deaths.array[i] != 21){
                let coord = generateRandomPointInsideSphere();

                const y = coord[1]
                const x = coord[0]
                const z = coord[2]

                deaths.array[i] = deaths.array[i] +1;
                positions.array[i * 3 + 1] = y
                positions.array[i * 3] = x
                positions.array[i * 3 + 2] = z
                
                velocities.array[i * 3] = Math.random() * 0.02 -0.01; // Random velocity in z direction
                velocities.array[i * 3 + 1] = Math.random() * 0.02 -0.01; // Random velocity in z direction
                velocities.array[i * 3 + 2] = Math.random() * 0.02 -0.01; // Random velocity in z directio
                
            }
            if(deaths.array[i] == 21){
                deathCounter++;
                positions.array[i * 3 ] = 0;
                positions.array[i * 3 + 1] = -(radius-capHeight)-5; 
                positions.array[i * 3 + 2] = 0
            }    
        }
    }

    // Set updated attributes back to the buffer geometry
    particles.setAttribute('position', positions);
    particles.setAttribute('velocity', velocities);
    particles.setAttribute('death', deaths);

    // Update particle system
    particleSystem.geometry.attributes.position.needsUpdate = true; 
    particleSystem.geometry.attributes.velocity.needsUpdate = true; 
    particleSystem.geometry.attributes.death.needsUpdate = true;

}

// Start the animation loop
animate();

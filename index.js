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
var shakeStateY, shakeStateX, shakeStateZ
var snowfallStarted1 = false;
var snowfallStarted2 = false;
const snowingVariable = {
    particleCount : 1000,
    gravitySpeed: 1 
}

// Create snow particles

const particles = new THREE.BufferGeometry();
const positions = new Float32Array(snowingVariable.particleCount * 3); // 3 values per vertex (x, y, z)
const velocities = new Float32Array(snowingVariable.particleCount * 3); // 3 values per velocity (vx, vy, vz)
const deaths = new Float32Array(snowingVariable.particleCount);
const state = new Float32Array(snowingVariable.particleCount);
const gravity = new THREE.Vector3(0, -0.005, 0); // Adjust gravity as needed
var flag = true;
var gravitySpeed = 1;


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
const treeBaseMaterial = new THREE.MeshBasicMaterial({color: '#66493A'})
const treeBase =  new THREE.Mesh(treeBaseGeometry, treeBaseMaterial);
treeBase.position.set(0, -((radius - capHeight)) + 3/2, 0);
scene.add(treeBase);

// Creating the top of the christmas tree
const treeHeight = 3
const treeCones1 = new THREE.ConeGeometry(2.5, 4, 8);
const treeCones2 = new THREE.ConeGeometry(2, 3, 8);

const treeConeMaterial = new THREE.MeshStandardMaterial({color: 'green', flatShading:true})
const treeCone1 =  new THREE.Mesh(treeCones1, treeConeMaterial);
treeCone1.position.set(0, treeBase.position.y+ 3/2+1 , 0);
const treeCone2 =  new THREE.Mesh(treeCones2, treeConeMaterial);
treeCone2.position.set(0, treeCone1.position.y+ 2.5/2 , 0);

const orbs = []

function drawChristmasOrbs(radius, height, segments, initialPosition) {
    const vertices = [];

    var colourIndex = Math.random()*3+1

    // Calculate angle between segments
    const angleIncrement = (2 * Math.PI) / segments;

    // Calculate vertices on the base circle
    for (let i = 0; i < segments; i++) {
        const angle = i * angleIncrement;
        const x = initialPosition.x + radius * Math.cos(angle);
        const z = initialPosition.z + radius * Math.sin(angle);
        const orbGeometry = new THREE.SphereGeometry(0.2)
        const orbRedMateriel = new THREE.MeshStandardMaterial({color: 'red'})
        const orbBlueMateriel = new THREE.MeshStandardMaterial({color: 'blue'})
        const orbYellowMateriel = new THREE.MeshStandardMaterial({color: 'yellow'})
        const orbPurpleMateriel = new THREE.MeshStandardMaterial({color: 'purple'})
        var orbMaterial;
        if(colourIndex%4 < 1){
            orbMaterial = orbRedMateriel
        }
        else if(colourIndex%4 <2){
            orbMaterial = orbBlueMateriel
        }
        else if(colourIndex%4 <3){
            orbMaterial = orbPurpleMateriel
        }
        else{
            orbMaterial = orbYellowMateriel
        }

        colourIndex = colourIndex + 1
        console.log(colourIndex);
        const orb =  new THREE.Mesh(orbGeometry, orbMaterial);

        orb.position.set(x, initialPosition.y, z)
        scene.add(orb);

        orbs.push(orb);


    }

    // Add apex vertex
    vertices.push(new THREE.Vector3(initialPosition.x, initialPosition.y + height, initialPosition.z));

    return vertices;
}


drawChristmasOrbs(2.5,4,8, new THREE.Vector3(treeBase.position.x, treeBase.position.y+0.5, treeBase.position.z))
drawChristmasOrbs(2,3,8, new THREE.Vector3(treeCone1.position.x, treeCone1.position.y-0.25, treeCone1.position.z))


scene.add(treeCone1);
scene.add(treeCone2);


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
//cameraFolder.add(camera.position, 'x', -200, 200, 1).name("X").onChange(camera.lookAt(top.position.x, top.position.y, top.position.z));
//cameraFolder.add(camera.position, 'y', -200, 200, 1).name("Y").onChange(camera.lookAt(top.position.x, top.position.y, top.position.z));
//cameraFolder.add(camera.position, 'z', -200, 200, 1).name("Z").onChange(camera.lookAt(top.position.x, top.position.y, top.position.z));
cameraFolder.add(camera.position, 'x', -200, 200, 1).name("X").onChange(updateCamera);
cameraFolder.add(camera.position, 'y', -200, 200, 1).name("Y").onChange(updateCamera);
cameraFolder.add(camera.position, 'z', -200, 200, 1).name("Z").onChange(updateCamera);
cameraFolder.open();

// Define new function updateCamera() upon camera change
function updateCamera() {
    camera.lookAt(scene.position);
}

var shakeAnimationFolder = gui.addFolder('Shaking Setting');
shakeAnimationFolder.add(shakingVariables, 'speed', 0, 3, 0.1).name("Speed");
shakeAnimationFolder.add(shakingVariables, 'animationFrames', 0, 500, 1).name("Animation Frame");
shakeAnimationFolder.open();

var snowAnimationFolder = gui.addFolder('Snowing Setting');
snowAnimationFolder.add(snowingVariable, 'gravitySpeed', 0, 3, 1).name("Gravity Speed");
snowAnimationFolder.add(snowingVariable, 'particleCount', 500, 2000, 1000).name("Number of Snow Particles");
snowAnimationFolder.open();

shakeAnimationFolder.add({ 'Shake Animation': shakeAnimationY }, 'Shake Animation').name("Shake Animation");

shakeAnimationFolder.add({ 'Shake Horizontal X Animation': shakeAnimationX }, 'Shake Horizontal X Animation').name("Shake Horizontal X Animation");
shakeAnimationFolder.add({ 'Shake Horizontal Z Animation': shakeAnimationZ }, 'Shake Horizontal Z Animation').name("Shake Horizontal Z Animation");


// Initialize velocity, position and states of each particle
function particleSystemInit(){
    for (let i = 0; i < snowingVariable.particleCount; i++) {
        let coord = generateRandomPointInsideSphere1();

        const y = coord[1]
        const x = coord[0]
        const z = coord[2]
        const vx = Math.random() * 0.02 - 0.01 // Random velocity in x direction
        const vy = Math.random() * 0.02 - 0.01; // Random velocity in y direction
        const vz = Math.random() * 0.02 -0.01; // Random velocity in z direction

        // Set particle position
        positions[i * 3] = 0;
        positions[i * 3 + 1] =  -(radius-capHeight+0.5);
        positions[i * 3 + 2] = 0;

        // Set particle velocity
        velocities[i * 3] = vx;
        velocities[i * 3 + 1] = vy;
        velocities[i * 3 + 2] = vz;
        
        //set particile's death counter
        deaths[i] = 0;
        state[i] = 0;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    particles.setAttribute('death', new THREE.BufferAttribute(deaths, 1));
    particles.setAttribute('state', new THREE.BufferAttribute(state, 1));

    particleSystem.geometry.attributes.position.needsUpdate = true; 
    particleSystem.geometry.attributes.velocity.needsUpdate = true; 
    particleSystem.geometry.attributes.death.needsUpdate = true;
    flag = true;
}

const particleMaterial = new THREE.PointsMaterial({
    size: 0.15,
    map: snowflakeTexture,
    transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending,
});

const particleSystem = new THREE.Points(particles, particleMaterial);


// Function to start the shaking animation
function shakeAnimationY() {
    t = 0;
    shakeStateY = true;
}

function shakeAnimationX() {
    t = 0;
    shakeStateX = true;
}

function shakeAnimationZ() {
    t = 0;
    shakeStateZ = true;
}


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    if (shakeStateY) {
        console.log("y");
        // Perform shaking animation
        if (t < shakingVariables.animationFrames) {
            if (shakingDirection == "D") {
                top.position.y -= 0.25 * shakingVariables.speed;
                base.position.y -= 0.25 * shakingVariables.speed;
                snowLayer.position.y -= 0.25 * shakingVariables.speed;
                treeBase.position.y -= 0.25 * shakingVariables.speed;
                treeCone1.position.y -= 0.25 * shakingVariables.speed;
                treeCone2.position.y -= 0.25 * shakingVariables.speed;
                for(var i = 0; i<orbs.length; i++){
                    orbs[i].position.y-=0.25* shakingVariables.speed;
                }


            } else if (shakingDirection == "U") {
                top.position.y += 0.25 * shakingVariables.speed;
                base.position.y += 0.25 * shakingVariables.speed;
                snowLayer.position.y += 0.25 * shakingVariables.speed;
                treeBase.position.y += 0.25 * shakingVariables.speed;
                treeCone1.position.y += 0.25 * shakingVariables.speed;
                treeCone2.position.y += 0.25 * shakingVariables.speed;
                for(var i = 0; i<orbs.length; i++){
                    orbs[i].position.y+=0.25* shakingVariables.speed;
                }
            
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
            shakeStateY = false; // Reset shake state
            scene.add(particleSystem); // Add snow particles to the scene
            particleSystemInit();
            // changeState(0)
        }
    } else if (snowfallStarted) {
        // Snowfall animation
        if (deathCounter<snowingVariable.particleCount) { // Convert duration to frames
            snowFalling("Y");

            if(deathCounter > snowingVariable.particleCount/2){
                const states = particles.getAttribute('state');
                for(var i = 0; i< snowingVariable.particleCount; i++){
                    if(states.array[i] == 0 && Math.random()*50<1){
                        states.array[i] = 1
                    }
                        
                }
                particles.setAttribute('state', states);
                particleSystem.geometry.attributes.state.needsUpdate = true; 
                flag = false;

            }

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
    if (shakeStateX) {
        console.log("s");
        // Perform shaking animation
        if (t < shakingVariables.animationFrames) {
            if (shakingDirection == "D") {
                top.position.x -= 0.25 * shakingVariables.speed;
                base.position.x -= 0.25 * shakingVariables.speed;
                snowLayer.position.x -= 0.25 * shakingVariables.speed;
                treeBase.position.x -= 0.25 * shakingVariables.speed;
                treeCone1.position.x -= 0.25 * shakingVariables.speed;
                treeCone2.position.x -= 0.25 * shakingVariables.speed;
                for(var i = 0; i<orbs.length; i++){
                    orbs[i].position.x-=0.25* shakingVariables.speed;
                }


            } else if (shakingDirection == "U") {
                top.position.x += 0.25 * shakingVariables.speed;
                base.position.x += 0.25 * shakingVariables.speed;
                snowLayer.position.x += 0.25 * shakingVariables.speed;
                treeBase.position.x += 0.25 * shakingVariables.speed;
                treeCone1.position.x += 0.25 * shakingVariables.speed;
                treeCone2.position.x += 0.25 * shakingVariables.speed;
                for(var i = 0; i<orbs.length; i++){
                    orbs[i].position.x+=0.25* shakingVariables.speed;
                }
            
            }

            if (top.position.x < -1 && shakingDirection == "D") {
                shakingDirection = "U";
            } else if (top.position.x > 1 && shakingDirection == "U") {
                shakingDirection = "D";
            }
            t++;
        } else {
            // Start snowfall animation after shaking animation ends
            snowfallStarted1 = true;
            shakeStateX = false; // Reset shake state
            scene.add(particleSystem); // Add snow particles to the scene
            particleSystemInit();
            // changeState(0)
        }
    } else if (snowfallStarted1) {
        // Snowfall animation
        if (deathCounter<snowingVariable.particleCount) { // Convert duration to frames
            snowFalling("X");
            if(deathCounter > snowingVariable.particleCount/2){
                const states = particles.getAttribute('state');
                for(var i = 0; i< snowingVariable.particleCount; i++){
                    if(states.array[i] == 0 && Math.random()*50<1){
                        states.array[i] = 1
                    }
                        
                }
                particles.setAttribute('state', states);
                particleSystem.geometry.attributes.state.needsUpdate = true; 
                flag = false;

            }

        }    
         else {
            deathCounter = 0;
            // Snowfall animation ended, reset variables for the next cycle
            snowfallStarted1 = false;
            scene.remove(particleSystem);
            particleSystemInit();
            count = 0;
        }
    }    
    if (shakeStateZ) {
        console.log("s");
        // Perform shaking animation
        if (t < shakingVariables.animationFrames) {
            if (shakingDirection == "D") {
                top.position.z -= 0.25 * shakingVariables.speed;
                base.position.z -= 0.25 * shakingVariables.speed;
                snowLayer.position.z -= 0.25 * shakingVariables.speed;
                treeBase.position.z -= 0.25 * shakingVariables.speed;
                treeCone1.position.z -= 0.25 * shakingVariables.speed;
                treeCone2.position.z -= 0.25 * shakingVariables.speed;
                for(var i = 0; i<orbs.length; i++){
                    orbs[i].position.z-=0.25* shakingVariables.speed;
                }


            } else if (shakingDirection == "U") {
                top.position.z += 0.25 * shakingVariables.speed;
                base.position.z += 0.25 * shakingVariables.speed;
                snowLayer.position.z += 0.25 * shakingVariables.speed;
                treeBase.position.z += 0.25 * shakingVariables.speed;
                treeCone1.position.z += 0.25 * shakingVariables.speed;
                treeCone2.position.z += 0.25 * shakingVariables.speed;
                for(var i = 0; i<orbs.length; i++){
                    orbs[i].position.z+=0.25* shakingVariables.speed;
                }
            
            }

            if (top.position.z < -1 && shakingDirection == "D") {
                shakingDirection = "U";
            } else if (top.position.z > 1 && shakingDirection == "U") {
                shakingDirection = "D";
            }
            t++;
        } else {
            // Start snowfall animation after shaking animation ends
            snowfallStarted2 = true;
            shakeStateZ = false; // Reset shake state
            scene.add(particleSystem); // Add snow particles to the scene
            particleSystemInit();
            // changeState(0)
        }
    } else if (snowfallStarted2) {
        // Snowfall animation
        if (deathCounter<snowingVariable.particleCount) { // Convert duration to frames
            snowFalling("Z");
            if(deathCounter > snowingVariable.particleCount/2){
                const states = particles.getAttribute('state');
                for(var i = 0; i< snowingVariable.particleCount; i++){
                    if(states.array[i] == 0 && Math.random()*50<1){
                        states.array[i] = 1
                    }
                        
                }
                particles.setAttribute('state', states);
                particleSystem.geometry.attributes.state.needsUpdate = true; 
                flag = false;

            }

        }    
         else {
            deathCounter = 0;
            // Snowfall animation ended, reset variables for the next cycle
            snowfallStarted2 = false;
            scene.remove(particleSystem);
            particleSystemInit();
            count = 0;
        }
    }    
}

function generateRandomPointInsideSphere1() {
    while(true){
        const y = Math.random()*(radius-2) + 2 
        const x = Math.random()*Math.sqrt(radius*radius-y*y)*2 -Math.sqrt(radius*radius - y*y) 
        const z = Math.random()*Math.sqrt(radius*radius-y*y)*2 -Math.sqrt(radius*radius - y*y)
        if(Math.sqrt((x- top.position.x)**2 + (y - top.position.y)**2 + (z-top.position.z)**2)<radius){
            return [x,y,z]
        }
    }    
}




function snowFalling(type){
    const positions = particles.getAttribute('position');
    const velocities = particles.getAttribute('velocity');
    const deaths = particles.getAttribute('death');
    const states = particles.getAttribute('state');
    // Update particle positions
    console.log(type)
    for (let i = 0; i < snowingVariable.particleCount; i++) {
        if(Math.random()*300 <=1){
            states.array[i] = 1;
        }

        if(deaths.array[i] <= 3 && states.array[i] == 1){
            // Update position based on velocity
            positions.array[i * 3] += velocities.array[i * 3];
            positions.array[i * 3 + 1] += velocities.array[i * 3 + 1];
            positions.array[i * 3 + 2] += velocities.array[i * 3 + 2];
            // Apply gravity

            if(type == "Y"){
                console.log("hello")
                velocities.array[i * 3 + 1] += gravity.y*snowingVariable.gravitySpeed;
            }
    


            // Reset particle position if it goes below the ground
            if (positions.array[i * 3 + 1] < -((radius - capHeight -0.5)) && deaths.array[i] != 21) {
                let coord = generateRandomPointInsideSphere1();

                const y = coord[1]
                const x = coord[0]
                const z = coord[2]

                deaths.array[i] = deaths.array[i] +1;
                positions.array[i * 3 + 1] = y
                positions.array[i * 3] = x
                positions.array[i * 3 + 2] = z

                if(type == "X"){
                    velocities.array[i * 3] = 0.1 // Random velocity in x direction
                    velocities.array[i * 3 + 1] = 0 // Random velocity in x direction
                    velocities.array[i * 3 + 2] = 0// Random velocity in x direction
                }
                else if(type == "Y"){
                    velocities.array[i * 3] = Math.random() * 0.02 - 0.01 // Random velocity in x direction
                    velocities.array[i * 3 + 1] = Math.random() * 0.02 - 0.01 // Random velocity in x direction
                    velocities.array[i * 3 + 2] = Math.random() * 0.02 - 0.01 // Random velocity in x direction
                }
                else{
                    velocities.array[i * 3] = 0 // Random velocity in x direction
                    velocities.array[i * 3 + 1] = 0 // Random velocity in x direction
                    velocities.array[i * 3 + 2] = 0.1// Random velocity in x direction
                }


            }
            else if(Math.sqrt((positions.array[i*3] - top.position.x)**2 + (positions.array[i*3+1]- top.position.y)**2 + (positions.array[i*3+2] -  top.position.z)**2)>radius && deaths.array[i] != 21){
                let coord = generateRandomPointInsideSphere1();
                const y = coord[1]
                const x = coord[0]
                const z = coord[2]

                deaths.array[i] = deaths.array[i] +1;

                if(type == "X"){
                    velocities.array[i * 3] = -velocities.array[i * 3 ] // Random velocity in x direction
                    velocities.array[i * 3 + 1] = 0  // Random velocity in x direction
                    velocities.array[i * 3 + 2] = 0// Random velocity in x direction
                }
                else if(type == "Y"){
                    positions.array[i * 3 + 1] = y
                    positions.array[i * 3] = x
                    positions.array[i * 3 + 2] = z
    
                    velocities.array[i * 3] = Math.random() * 0.02 - 0.01 // Random velocity in x direction
                    velocities.array[i * 3 + 1] = Math.random() * 0.02 - 0.01 // Random velocity in x direction
                    velocities.array[i * 3 + 2] = Math.random() * 0.02 - 0.01 // Random velocity in x direction
                }
                else{
                
                    velocities.array[i * 3] = 0 // Random velocity in x direction
                    velocities.array[i * 3 + 1] = 0  // Random velocity in x direction
                    velocities.array[i * 3 + 2] = -velocities.array[i * 3 + 2]// Random velocity in x direction
                }

            }
            if(deaths.array[i] == 4){
                deathCounter++;
                positions.array[i * 3 ] = 0;
                positions.array[i * 3 + 1] = -(radius-capHeight + 0.5); 
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

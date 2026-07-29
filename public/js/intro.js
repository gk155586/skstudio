import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { FontLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://unpkg.com/three@0.160.0/examples/jsm/geometries/TextGeometry.js';

document.addEventListener('DOMContentLoaded', initIntro);

function initIntro() {
    // Create full screen overlay
    const overlay = document.createElement('div');
    overlay.id = 'intro-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#050505',
        zIndex: '999999',
        overflow: 'hidden',
        transition: 'opacity 1.5s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
    });

    const loadingText = document.createElement('div');
    loadingText.id = 'intro-loading';
    Object.assign(loadingText.style, {
        position: 'absolute',
        color: '#ffffff',
        letterSpacing: '6px',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        transition: 'opacity 0.5s',
        fontWeight: 'bold',
        zIndex: '10'
    });
    loadingText.innerText = 'INITIALIZING CAMERA...';
    overlay.appendChild(loadingText);

    // Flash overlay
    const flashDiv = document.createElement('div');
    Object.assign(flashDiv.style, {
        position: 'absolute',
        top: '0', left: '0', right: '0', bottom: '0',
        backgroundColor: '#ffffff',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '1000000',
        transition: 'opacity 1.2s ease-out'
    });
    overlay.appendChild(flashDiv);

    document.body.appendChild(overlay);

    // Stop background scroll during intro
    document.body.style.overflow = 'hidden';

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.001);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 3000);
    // Start very far away
    camera.position.set(0, 0, 1400);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    overlay.appendChild(renderer.domElement);

    // Lights for premium look
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 80000);
    spotLight.position.set(100, 150, 100);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const backLight = new THREE.PointLight(0x4488ff, 60000, 1000);
    backLight.position.set(-100, 0, -100);
    scene.add(backLight);

    // Group holding the 3D Camera Model
    const cameraGroup = new THREE.Group();
    scene.add(cameraGroup);

    // --- Build Realistic-Stylized 3D Camera ---
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8, metalness: 0.2 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.9 });
    const glassMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x050505, metalness: 0.9, roughness: 0.05, 
        clearcoat: 1.0, clearcoatRoughness: 0.1, transmission: 0.8
    });

    // 1. Camera Body
    const bodyGeo = new THREE.BoxGeometry(45, 30, 15);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    cameraGroup.add(bodyMesh);

    // 2. Silver Top Plate
    const topGeo = new THREE.BoxGeometry(45, 4, 15);
    const topMesh = new THREE.Mesh(topGeo, silverMat);
    topMesh.position.y = 17;
    cameraGroup.add(topMesh);

    // 3. Lens Base (Cylinder)
    const lensGeo = new THREE.CylinderGeometry(12, 12, 16, 32);
    lensGeo.rotateX(Math.PI / 2);
    const lensMesh = new THREE.Mesh(lensGeo, bodyMat);
    lensMesh.position.z = 15;
    cameraGroup.add(lensMesh);

    // 4. Lens Glass
    const glassGeo = new THREE.CylinderGeometry(9, 9, 1, 32);
    glassGeo.rotateX(Math.PI / 2);
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 23;
    cameraGroup.add(glassMesh);

    // 5. Flash Unit / Viewfinder
    const flashBoxGeo = new THREE.BoxGeometry(14, 10, 14);
    const flashBoxMesh = new THREE.Mesh(flashBoxGeo, bodyMat);
    flashBoxMesh.position.set(0, 23, 0);
    cameraGroup.add(flashBoxMesh);

    // 6. Flash Emitter Light (The "Flash" effect)
    const flashEmitter = new THREE.PointLight(0xffffff, 0, 800);
    flashEmitter.position.set(0, 23, 10);
    cameraGroup.add(flashEmitter);

    // --- Load Text ---
    const loader = new FontLoader();
    loader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', (font) => {
        loadingText.style.opacity = '0';
        
        const textMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5 });
        const textGeo = new TextGeometry('SK STUDIO PUNE', {
            font: font, size: 2.2, height: 0.5, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1
        });
        textGeo.computeBoundingBox();
        const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
        
        const textMesh = new THREE.Mesh(textGeo, textMat);
        textMesh.position.set(centerOffset, -10, 8); // Sit under the lens on body
        cameraGroup.add(textMesh);

        // Add a click listener to skip intro
        overlay.addEventListener('click', skipIntro);

        // Wait a small moment, then start animation
        setTimeout(startAnimation, 300);
    });

    let isAnimating = false;
    let startTime = 0;
    let introFinished = false;

    function startAnimation() {
        if (introFinished) return;
        isAnimating = true;
        startTime = performance.now();
    }

    function skipIntro() {
        if (introFinished) return;
        introFinished = true;
        flashDiv.style.opacity = '1';
        setTimeout(finishIntro, 50);
    }

    function finishIntro() {
        // Fade out white flash slowly revealing site
        flashDiv.style.transition = 'opacity 1.5s ease-in-out';
        flashDiv.style.opacity = '0';
        overlay.style.transition = 'opacity 1.5s ease-in-out';
        overlay.style.opacity = '0';
        
        // Restore scroll
        document.body.style.overflow = '';
        
        // Cleanup DOM
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 1500);
    }

    // Animation Loop
    function animate() {
        if (!introFinished) {
            requestAnimationFrame(animate);
        } else {
            return; // stop rendering
        }
        
        const time = performance.now() - startTime;
        
        if (isAnimating) {
            // Intro length: 4 seconds
            const duration = 4000;
            const progress = Math.min(time / duration, 1);
            
            // Easing (Cubic Out) for a smooth "landing"
            const easeOut = 1 - Math.pow(1 - progress, 4);
            
            // Camera position: moves from 1400 down to 80
            camera.position.z = 1400 - (1320 * easeOut);
            
            // 3D Camera Object rotates elegantly as it flies
            cameraGroup.rotation.y = Math.sin(easeOut * Math.PI) * 2;
            cameraGroup.rotation.x = Math.sin(easeOut * Math.PI * 0.5) * 0.5;
            
            // Subtle floating
            cameraGroup.position.y = Math.sin(time / 400) * 4;

            // Trigger Flash Effect exactly when it reaches its closest point
            if (progress > 0.88 && progress < 0.98) {
                // Intense Flash
                flashEmitter.intensity = 800000;
                if (progress > 0.93) {
                    flashDiv.style.opacity = '1';
                }
            } else {
                flashEmitter.intensity = 0;
            }

            // Finish
            if (progress >= 1 && !introFinished) {
                introFinished = true;
                finishIntro();
            }
        }
        
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        if (!introFinished) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });
}

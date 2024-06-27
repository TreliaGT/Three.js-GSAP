import React, { useEffect, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap'; // Import GSAP
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const ThreeD = () => {
    const refContainer = useRef(null);
    const modelRef = useRef(null); // Use a ref to hold the model
    const scene = useRef(new THREE.Scene()).current;
    
    useEffect(() => {
        let model = null;
        const main = document.querySelector('main');
        const mainHeight = main.getBoundingClientRect().height;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / mainHeight, 0.1, 1000);
        camera.position.set(0, 0, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, mainHeight);
        renderer.setClearColor(0xfaf0e6);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true; // Enable shadow mapping

        const container = refContainer.current;
        container.appendChild(renderer.domElement);

        // Ambient light to illuminate the scene
        const ambientLight = new THREE.AmbientLight(0xffffff, 3);
        scene.add(ambientLight);

        // Directional light for casting shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(10, 15, 10); // Adjust light position
        directionalLight.castShadow = true; // Enable shadow casting
        scene.add(directionalLight);

        // Set up shadow properties for the light
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;

        const loader = new GLTFLoader();
        const modelPath = '/assets/cosmetic_tube_1.glb';

        loader.load(
            modelPath,
            (gltf) => {
                console.log('Model loaded successfully:', gltf);
                model = gltf.scene;
                model.position.set(0, 1.2, 0);
                model.rotateY(360); // Adjust rotation as needed
                model.scale.set(1.5, 1.5, 1.5);

                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true; // Enable shadow casting for each mesh
                        child.receiveShadow = true; // Enable shadow receiving for each mesh
                        child.material.side = THREE.DoubleSide;
                    }
                });

                scene.add(model);
                modelRef.current = model; // Store model in ref for access outside of loader callback
                // Initialize GSAP animation timeline once model is loaded
                initAnimation();
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100).toFixed(2) + '% loaded');
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );

        // GSAP animation timeline
        const tl = gsap.timeline({ paused: true });
        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.defaults({
            markers: true // Easaly remove markers for production 
        });
         
        // Initialize GSAP animation function
        const initAnimation = () => {
            gsap.timeline({
                scrollTrigger: {
                    trigger: refContainer.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: true,
                }
            })
            .to(model.position, { y: -1, duration: 1 })
            .to(model.rotation, {
                y: Math.PI * 2, // Rotate 360 degrees
                duration: 1, // Animation duration
                ease: 'power2.out' // Easing function
            }, '-=1');

            ScrollTrigger.create({
                trigger: "#two",
                start: "top center",
                end:"bottom center",
                onEnter: () => {
                    gsap.to(model.position, { x: 2, y:-2, duration: 1 });
                    gsap.to(model.rotation, { z: 3.5 , duration: 1 });
                    gsap.to(model.scale, { x: 1, y: 1, z: 1, duration: 1 }); // Scale down
                },
                onLeaveBack: () => {
                    gsap.to(model.position, { x: 0,  duration: 1 });
                    gsap.to(model.rotation, { z: Math.PI, duration: 1 });
                   gsap.to(model.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 1 }); // Reset scale
                }
            });

            ScrollTrigger.create({
                trigger: "#three",
                start: "top center",
                end:"bottom center",
                onEnter: () => {
                    gsap.to(model.position, { y: -4.2, x: 0, duration: 1 });
                    gsap.to(model.rotation, { y: Math.PI, duration: 1 });
                    gsap.to(model.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1 }); // Reset scale
                },
                onLeaveBack: () => {
                    gsap.to(model.position, { x: 0, duration: 1 });
                    gsap.to(model.rotation, { y: Math.PI, duration: 1 });
                    gsap.to(model.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 1 }); // Reset scale
                }
            });
    };

  
        // Scroll event handler using GSAP
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const progress = scrollY / (document.body.clientHeight - window.innerHeight);

            // Update GSAP timeline progress based on scroll position
            if (modelRef.current) {
                tl.progress(progress).pause();
            }
        };

        // Attach scroll event listener
        window.addEventListener('scroll', handleScroll);

        // Animation loop
        const animate = function () {
            requestAnimationFrame(animate);

            // Render Three.js scene
            renderer.render(scene, camera);
        };

        animate();

        // Clean up
        return () => {
            window.removeEventListener('scroll', handleScroll);
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div className="three-d-container" ref={refContainer}>
        </div>
    );
};

export default ThreeD;

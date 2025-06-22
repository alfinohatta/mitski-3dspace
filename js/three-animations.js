/**
 * Three.js Animation Module
 * Handles all 3D animations and graphics throughout the site
 */

class ThreeJSAnimator {
    constructor(canvasId, color1 = 0x00FFFF, color2 = 0xFF00FF) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Canvas with id '${canvasId}' not found`);
            return;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.canvas.clientWidth / this.canvas.clientHeight, 
            0.1, 
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.color1 = color1;
        this.color2 = color2;
        this.objects = [];
        this.animationId = null;
        this.isPlaying = true;
        
        this.setupScene();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        // Add ambient lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Add directional lighting
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Add point light for extra illumination
        const pointLight = new THREE.PointLight(0xffffff, 0.4, 100);
        pointLight.position.set(-10, -10, -5);
        this.scene.add(pointLight);
        
        this.camera.position.z = 5;
    }

    setupEventListeners() {
        // Handle resize
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                this.handleResize();
            }
        });
        
        if (this.canvas) {
            resizeObserver.observe(this.canvas);
        }

        // Pause animation when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.play();
            }
        });

        // Handle intersection observer for performance
        const intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.target === this.canvas) {
                    if (entry.isIntersecting) {
                        this.play();
                    } else {
                        this.pause();
                    }
                }
            });
        }, { threshold: 0.1 });

        intersectionObserver.observe(this.canvas);
    }

    createFloatingGeometry(type = 'sphere', options = {}) {
        let geometry;
        
        const defaults = {
            size: 0.8,
            segments: 32,
            detail: 0
        };
        
        const config = { ...defaults, ...options };
        
        switch(type) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(config.size, config.segments, config.segments);
                break;
            case 'cube':
                geometry = new THREE.BoxGeometry(config.size, config.size, config.size);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(config.size * 0.7, config.size * 0.3, 16, 100);
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(config.size);
                break;
            case 'icosahedron':
                geometry = new THREE.IcosahedronGeometry(config.size, config.detail);
                break;
            case 'tetrahedron':
                geometry = new THREE.TetrahedronGeometry(config.size);
                break;
            default:
                geometry = new THREE.SphereGeometry(config.size, config.segments, config.segments);
        }
        
        const material = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? this.color1 : this.color2,
            shininess: 100,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Random positioning
        mesh.position.set(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 3
        );
        
        // Random rotation
        mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        
        // Animation properties
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.01 + 0.005,
            floatAmount: Math.random() * 0.5 + 0.2,
            originalPosition: mesh.position.clone(),
            scale: config.size,
            pulseSpeed: Math.random() * 0.02 + 0.01
        };
        
        this.scene.add(mesh);
        this.objects.push(mesh);
        
        return mesh;
    }

    animate() {
        if (!this.isPlaying) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        this.objects.forEach((obj, index) => {
            // Rotation animation
            obj.rotation.x += obj.userData.rotationSpeed.x;
            obj.rotation.y += obj.userData.rotationSpeed.y;
            obj.rotation.z += obj.userData.rotationSpeed.z;
            
            // Floating animation
            const floatOffset = Math.sin(time * obj.userData.floatSpeed + index) * obj.userData.floatAmount * 0.1;
            obj.position.y = obj.userData.originalPosition.y + floatOffset;
            
            // Subtle scaling/pulsing
            const pulse = 1 + Math.sin(time * obj.userData.pulseSpeed + index) * 0.1;
            obj.scale.setScalar(obj.userData.scale * pulse);
            
            // Color shifting
            if (obj.material && obj.material.color) {
                const hue = (time * 0.1 + index * 0.1) % 1;
                obj.material.color.setHSL(hue, 0.7, 0.6);
            }
        });
        
        // Camera slight movement for dynamic feel
        this.camera.position.x = Math.sin(time * 0.1) * 0.5;
        this.camera.position.y = Math.cos(time * 0.15) * 0.3;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        if (!this.canvas || !this.camera || !this.renderer) return;
        
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.animate();
        }
    }

    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    dispose() {
        this.pause();
        
        // Clean up objects
        this.objects.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
            this.scene.remove(obj);
        });
        
        // Clean up renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.objects = [];
    }

    addRandomObjects(count = 3) {
        const types = ['sphere', 'cube', 'torus', 'octahedron', 'icosahedron', 'tetrahedron'];
        
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const size = Math.random() * 0.5 + 0.5;
            this.createFloatingGeometry(type, { size });
        }
    }
}

// Hero section specialized animator
class HeroAnimator extends ThreeJSAnimator {
    constructor() {
        super('hero-canvas', 0x00FFFF, 0xFF00FF);
        this.createHeroScene();
    }

    createHeroScene() {
        const types = ['sphere', 'cube', 'torus', 'octahedron', 'icosahedron'];
        
        // Create more objects for the hero section
        for (let i = 0; i < 20; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const size = Math.random() * 0.8 + 0.4;
            this.createFloatingGeometry(type, { size });
        }
        
        // Add some larger focal objects
        for (let i = 0; i < 3; i++) {
            const size = Math.random() * 1.5 + 1;
            this.createFloatingGeometry('icosahedron', { size });
        }
    }
}

// Animation manager for all canvas elements
class AnimationManager {
    constructor() {
        this.animators = new Map();
        this.cardConfigs = [
            { id: 'about-canvas-1', colors: [0x00FFFF, 0x6600CC] },
            { id: 'about-canvas-2', colors: [0xFF00FF, 0x00CC66] },
            { id: 'about-canvas-3', colors: [0xFFFF00, 0xFF6600] },
            { id: 'services-canvas-1', colors: [0x00CC66, 0x00FFFF] },
            { id: 'services-canvas-2', colors: [0xFF6600, 0xFF00FF] },
            { id: 'services-canvas-3', colors: [0x6600CC, 0xFFFF00] },
            { id: 'services-canvas-4', colors: [0x00FFFF, 0xFF6600] },
            { id: 'collections-canvas-1', colors: [0xFF00FF, 0x00CC66] },
            { id: 'collections-canvas-2', colors: [0xFFFF00, 0x6600CC] },
            { id: 'collections-canvas-3', colors: [0x00FFFF, 0xFF00FF] },
            { id: 'testimonials-canvas-1', colors: [0x00CC66, 0xFFFF00] },
            { id: 'testimonials-canvas-2', colors: [0xFF6600, 0x00FFFF] },
            { id: 'testimonials-canvas-3', colors: [0x6600CC, 0xFF00FF] },
            { id: 'events-canvas-1', colors: [0x00FFFF, 0x00CC66] },
            { id: 'events-canvas-2', colors: [0xFF00FF, 0xFFFF00] },
            { id: 'faq-canvas-1', colors: [0xFFFF00, 0x6600CC] },
            { id: 'faq-canvas-2', colors: [0x00CC66, 0xFF6600] },
            { id: 'careers-canvas-1', colors: [0xFF6600, 0x00FFFF] },
            { id: 'careers-canvas-2', colors: [0x6600CC, 0x00CC66] },
            { id: 'contact-canvas-1', colors: [0x00FFFF, 0xFF00FF] },
            { id: 'contact-canvas-2', colors: [0xFFFF00, 0xFF6600] }
        ];
    }

    init() {
        // Initialize hero animation
        this.initHeroAnimation();
        
        // Initialize card animations with delay for performance
        setTimeout(() => {
            this.initCardAnimations();
        }, 500);
    }

    initHeroAnimation() {
        try {
            const heroAnimator = new HeroAnimator();
            this.animators.set('hero-canvas', heroAnimator);
        } catch (error) {
            console.error('Failed to initialize hero animation:', error);
        }
    }

    initCardAnimations() {
        this.cardConfigs.forEach((config, index) => {
            // Stagger initialization to prevent performance issues
            setTimeout(() => {
                try {
                    const animator = new ThreeJSAnimator(config.id, config.colors[0], config.colors[1]);
                    if (animator.canvas) {
                        animator.addRandomObjects(3);
                        this.animators.set(config.id, animator);
                    }
                } catch (error) {
                    console.error(`Failed to initialize animation for ${config.id}:`, error);
                }
            }, index * 50);
        });
    }

    pauseAll() {
        this.animators.forEach(animator => {
            animator.pause();
        });
    }

    playAll() {
        this.animators.forEach(animator => {
            animator.play();
        });
    }

    dispose() {
        this.animators.forEach(animator => {
            animator.dispose();
        });
        this.animators.clear();
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for WebGL support
    if (!window.WebGLRenderingContext) {
        console.warn('WebGL not supported, skipping 3D animations');
        return;
    }

    const animationManager = new AnimationManager();
    animationManager.init();

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        animationManager.dispose();
    });

    // Export for debugging
    window.animationManager = animationManager;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThreeJSAnimator, HeroAnimator, AnimationManager };
}
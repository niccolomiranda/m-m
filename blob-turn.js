Number.prototype.map = function(in_min, in_max, out_min, out_max) {
	return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

function loadModel(model) {
	return new Promise((resolve, reject) => {
		const ext = model.url.split(".").pop();

		switch (ext) {
			case "obj": {
				const loader = new THREE.OBJLoader();

				// load a resource
				loader.load(
					// resource URL
					model.url,
					// Function when resource is loaded
					object => {
						resolve({ id: model.id, media: object, type: "obj" });
					},

					() => {},
					() => {
						reject("An error happened with the model import.");
					}
				);
				break;
			}

			case "gltf": {
				const loader = new THREE.GLTFLoader();

				// load a resource
				loader.load(
					// resource URL
					model.url,
					// Function when resource is loaded
					object => {
						resolve({ id: model.id, media: object, type: "gltf" });
					},

					() => {},
					() => {
						reject("An error happened with the model import.");
					}
				);
				break;
			}

			default: {
				const loader = new THREE.OBJLoader();

				// load a resource
				loader.load(
					// resource URL
					model.url,
					// Function when resource is loaded
					object => {
						resolve({ id: model.id, media: object, type: "obj" });
					},

					() => {},
					() => {
						reject("An error happened with the model import.");
					}
				);
			}
		}
	});
}

//main app
class App {
	constructor() {
		this.speedTime = 0.25;
		this.time = 0;
		this.clock = new THREE.Clock();
		this.init();
		window.addEventListener("resize", this.onWindowResize.bind(this), false);
	}

	init() {
		// renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio = window.devicePixelRatio;
		document.querySelector('main').appendChild(this.renderer.domElement);

		// scene
		this.scene = new THREE.Scene();

		// camera
		this.camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		this.camera.position.set(0, 0, 10);

		// controls
		this.controls = new THREE.OrbitControls(
			this.camera,
			document.querySelector("canvas")
		);
		this.controls.enabled = true;
		this.controls.enablePan = false;

		// ambient light
		// this.scene.add(new THREE.AmbientLight(0x222222));

		let lightTop = new THREE.DirectionalLight(0xffffff, 0.7);
		lightTop.position.set(0, 500, 200);
		lightTop.castShadow = true;
		this.scene.add(lightTop);

		let lightBottom = new THREE.DirectionalLight(0xffffff, 0.25);
		lightBottom.position.set(0, -500, 400);
		lightBottom.castShadow = true;
		this.scene.add(lightBottom);

		let ambientLight = new THREE.AmbientLight(0x798296);
		this.scene.add(ambientLight);

		// axes
		// this.scene.add(new THREE.AxesHelper(20));

		this.addBlob();

		this.load().then(assets => {
			this.addPostProcessing(assets);
			this.isPostProcessingEnabled = false;

			this.addGUI();
		});

		//animation loop
		this.renderer.setAnimationLoop(this.render.bind(this));
	}

	addBlob() {
		let geometry = new THREE.SphereBufferGeometry(1, 256, 256);
		let phongShader = THREE.ShaderLib.phong;
		let standardShader = THREE.ShaderLib.standard;
		standardShader.uniforms.metalness.value = 0.0
		standardShader.uniforms.roughness.value = 0.8
		// phongShader.uniforms.emissive.value = {r:0.4,g:0.6,b:0.9}
		// phongShader.uniforms.specular.value = {r:40/255,g:40/255,b:40/255}
		// phongShader.uniforms.shininess.value = 100
		let uniforms = THREE.UniformsUtils.merge([
			standardShader.uniforms,
			{
				uTime: {
					value: 0.0
				},
				uFrequency: {
					value: 0.6
				},
				uAmplitude: {
					value: 1.5
				}
			}
		]);
		// let fragmentShader = phongShader.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );','gl_FragColor = vec4( (outgoingLight, 1.0 );')
		let fragmentShader = standardShader.fragmentShader
		fragmentShader = fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );',document.querySelector("#fragmentShader").textContent)
		let material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: document.querySelector("#vertexShader").textContent,
			fragmentShader: fragmentShader,
			lights: true,
			onBeforeCompile: () => {
				// console.log(fragmentShader);
			}
		});
		this.blob = new THREE.Mesh(geometry, material);
		this.scene.add(this.blob);
	}

	load() {
		const assets = new Map();
		const loadingManager = new THREE.LoadingManager();

		return new Promise((resolve, reject) => {
			loadingManager.onError = reject;
			loadingManager.onProgress = (item, loaded, total) => {
				if (loaded === total) {
					resolve(assets);
				}
			};

			const searchImage = new Image();
			const areaImage = new Image();

			searchImage.addEventListener("load", function() {
				assets.set("smaa-search", this);
				loadingManager.itemEnd("smaa-search");
			});

			areaImage.addEventListener("load", function() {
				assets.set("smaa-area", this);
				loadingManager.itemEnd("smaa-area");
			});

			// Register the new image assets.
			loadingManager.itemStart("smaa-search");
			loadingManager.itemStart("smaa-area");

			// Load the images asynchronously.
			searchImage.src = PP.SMAAEffect.searchImageDataURL;
			areaImage.src = PP.SMAAEffect.areaImageDataURL;
		});
	}

	addPostProcessing(assets) {
		// this.renderer = renderer;
		this.composer = new PP.EffectComposer(this.renderer);

		this.noiseEffect = new PP.NoiseEffect({ premultiply: true });
		this.vignetteEffect = new PP.VignetteEffect();
		this.bloomEffect = new PP.BloomEffect();

		this.SMAAEffect = new PP.SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area")
		);
		this.SMAAEffect.setOrthogonalSearchSteps(112);
		this.SMAAEffect.setEdgeDetectionThreshold(0.5);
		this.chromaticAberrationEffect = new PP.ChromaticAberrationEffect();

		this.renderPass = new PP.RenderPass(this.scene, this.camera);
		this.effectPass = new PP.EffectPass(
			this.camera,
			this.SMAAEffect

			// this.SMAAEffect
		);

		this.effectPass2 = new PP.EffectPass(
			this.chromaticAberrationEffect,
			this.bloomEffect
		);

		// this.noiseEffect.blendMode.opacity.value = 0.75;
		this.effectPass2.renderToScreen = true;

		this.composer.addPass(this.renderPass);
		this.composer.addPass(this.effectPass);
		this.composer.addPass(this.effectPass2);
	}

	render() {
		// this.clock.update();
		let deltaTime = this.clock.getDelta() * this.speedTime;
		this.time = this.time + deltaTime;

		this.blob.material.uniforms.uTime.value = this.time;

		Boolean(this.isPostProcessingEnabled)
			? this.composer.render(this.clock.getDelta())
			: this.renderer.render(this.scene, this.camera);
	}

	addGUI() {
		this.gui = new dat.GUI();

		this.params = {
			postprocessing: {
				enabled: true,
				bloom: {
					blendFunction: PP.BlendFunction.SCREEN,
					resolutionScale: 0.5,
					kernelSize: PP.KernelSize.LARGE,
					distinction: 1.0,
					dithering: false
				},
				chroma: {
					offset: {
						x: 0,
						y: 0
					}
				},
				SMAA: {
					searchStep: 112,
					edgeDetectionThreshold: 0.5
				}
			}
		};

		let pp = this.gui.addFolder("post-processing");
		// pp.open();
		pp.add(this, "isPostProcessingEnabled").name("enabled");

		//bloom
		let bloom = pp.addFolder("bloom");
		// bloom.open();

		bloom
			.add(this.params.postprocessing.bloom, "resolutionScale", 0.01, 1)
			.name("resolution")
			.onChange(value => {
				this.bloomEffect.setResolutionScale(value);
			});

		bloom
			.add(this.params.postprocessing.bloom, "kernelSize", PP.KernelSize)
			.name("kernel size")
			.onChange(value => {
				this.bloomEffect.kernelSize = value;
			});

		let luminance = bloom.addFolder("Luminance");
		// luminance.open();
		luminance
			.add(this.params.postprocessing.bloom, "distinction", 1, 10)
			.name("distinction")
			.onChange(value => {
				this.bloomEffect.distinction = value;
			});

		// bloom
		// 	.add(this.params.postprocessing.bloom, "blendFunction", PP.BlendFunction)
		// 	.name("blend mode")
		// 	.onChange(value => {
		// 		this.bloomEffect.blendMode.blendFunction = parseInt(value);
		// 	});

		bloom
			.add(this.params.postprocessing.bloom, "dithering")
			.name("dithering")
			.onChange(value => {
				this.bloomEffect.dithering = value;
			});

		let chroma = pp.addFolder("chromatic aberration");
		// chroma.open()

		let offset = chroma.addFolder("offset");
		offset
			.add(this.params.postprocessing.chroma.offset, "x", -0.01, 0.01)
			.step(0.001)
			.onChange(value => {
				this.chromaticAberrationEffect.offset.x = value;
			});

		offset
			.add(this.params.postprocessing.chroma.offset, "y", -0.01, 0.01)
			.step(0.001)
			.onChange(value => {
				this.chromaticAberrationEffect.offset.y = value;
			});

		let SMAA = pp.addFolder("SMAA");
		// SMAA.open()

		SMAA.add(this.params.postprocessing.SMAA, "searchStep", 0, 112)
			.name("search step")
			.onChange(value => {
				this.SMAAEffect.setOrthogonalSearchSteps(value);
			});

		SMAA.add(this.params.postprocessing.SMAA, "edgeDetectionThreshold", 0.05, 0.5)
			.name("sensitivity")
			.step(0.01)
			.onChange(value => {
				this.SMAAEffect.setEdgeDetectionThreshold(value);
			});

		this.gui
			.add(this, "speedTime")
			.min(0.01)
			.max(1)
			.step(0.01)
			.name("speed time");
		this.gui
			.add(this.blob.material.uniforms.uFrequency, "value")
			.min(0.01)
			.max(2)
			.step(0.01)
			.name("frequency");
		this.gui
			.add(this.blob.material.uniforms.uAmplitude, "value")
			.min(0)
			.max(2)
			.step(0.01)
			.name("amplitude");
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}

const PP = POSTPROCESSING;

const simplex = new SimplexNoise();

//init app
const app = new App();

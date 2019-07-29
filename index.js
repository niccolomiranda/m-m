/**
 * Copyright 2019, Cobo
 * This resource is property of Cobo Srl. It is not allowed to take the resource to use or build
 * upon in personal or commercial projects such as websites, web apps and web templates
 * intended for sale. It is not allowed to take the resource "as-is" and sell it, redistribute,
 * re-publish it, or sell "pluginized" versions of it. Always consider the licenses of all included
 * libraries, scripts and images used.
 */

const WIDTH = 128;
const BOUNDS = 512;
const BOUNDS_HALF = BOUNDS * 0.5;

let effectController = {
	mouseSize: 20.0,
	viscosity: 0.98
};

//main app
class App {
	constructor() {
		this.speedTime = 1;
		this.time = 0;
		this.clock = new THREE.Clock();
		this.mouse = new THREE.Vector2(0, 0);
		this.raycaster = new THREE.Raycaster();
		this.init();
		window.addEventListener("resize", this.onWindowResize.bind(this), false);
		window.addEventListener("mousemove", this.onMouseMove.bind(this), false);
		document.addEventListener("mousedown", this.onMouseDown.bind(this), false);
		document.addEventListener("mouseup", this.onMouseUp.bind(this), false);
	}

	init() {
		// renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
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
		this.camera.position.set(0, 0, 7);

		// controls
		this.controls = new THREE.OrbitControls(
			this.camera,
			document.querySelector("canvas")
		);
		this.controls.enabled = false;
		this.controls.enablePan = false;

		// ambient light
		// this.scene.add(new THREE.AmbientLight(0x222222));

		this.lightTop = new THREE.DirectionalLight(0xe6c9f7, 0.55);
		this.lightTop.position.set(0, 500, 300);
		// lightTop.castShadow = true;
		this.scene.add(this.lightTop);

		this.lightBottom = new THREE.DirectionalLight(0x36e8e8, 0.2);
		this.lightBottom.position.set(0, -500, 400);
		// this.lightBottom.castShadow = true;
		this.scene.add(this.lightBottom);

		let ambientLight = new THREE.AmbientLight(0x7d8cdb);
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
		let blobGeometry = new THREE.SphereGeometry(BOUNDS, WIDTH - 1, WIDTH - 1);
		let shader = THREE.ShaderLib.phong;
		shader.uniforms.diffuse.value = [
			0.8941176470588236,
			0.9254901960784314,
			0.9803921568627451
		];
		shader.uniforms.shininess.value = 200;
		let uniforms = THREE.UniformsUtils.merge([
			shader.uniforms,
			{
				uTime: {
					value: 0.0
				},
				uFrequency: {
					value: 0.7
				},
				uAmplitude: {
					value: 0.5
				},
				uHeightMap: {
					value: null
				}
			}
		]);
		let fragmentShader = shader.fragmentShader;
		fragmentShader =
			document.querySelector("#fragmentShaderBeforeMain").textContent +
			fragmentShader.replace(
				"vec4 diffuseColor = vec4( diffuse, opacity );",
				document.querySelector("#fragmentShader").textContent
			);

		let blobMaterial = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: document.querySelector("#vertexShader").textContent,
			fragmentShader: fragmentShader,
			lights: true,
			defines: {
				WIDTH: WIDTH.toFixed(1),
				BOUNDS: BOUNDS.toFixed(1)
			}
		});

		this.blob = new THREE.Mesh(blobGeometry, blobMaterial);
		this.scene.add(this.blob);

		this.blob.rotation.y = THREE.Math.degToRad(-45);

		let shadowBlobGeometry = new THREE.SphereBufferGeometry(1.2, 16, 16);
		this.shadowBlob = new THREE.Mesh(
			shadowBlobGeometry,
			new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
		);
		this.scene.add(this.shadowBlob);

		this.gpuCompute = new THREE.GPUComputationRenderer(
			WIDTH,
			WIDTH,
			this.renderer
		);
		let heightmap = this.gpuCompute.createTexture();
		this.fillTexture(heightmap);

		this.heightmapVariable = this.gpuCompute.addVariable(
			"heightmap",
			document.getElementById("heightmapFragmentShader").textContent,
			heightmap
		);
		this.gpuCompute.setVariableDependencies(this.heightmapVariable, [
			this.heightmapVariable
		]);
		this.heightmapVariable.material.uniforms["mousePos"] = {
			value: new THREE.Vector3(10000, 10000)
		};
		this.heightmapVariable.material.uniforms["mouseSize"] = {
			value: effectController.mouseSize
		};
		this.heightmapVariable.material.uniforms["viscosityConstant"] = {
			value: effectController.viscosity
		};
		this.heightmapVariable.material.uniforms["heightCompensation"] = { value: 0 };
		this.heightmapVariable.material.defines.BOUNDS = BOUNDS.toFixed(1);
		let error = this.gpuCompute.init();
		if (error !== null) {
			console.error(error);
		}

		this.smoothShader = this.gpuCompute.createShaderMaterial(
			document.getElementById("smoothFragmentShader").textContent,
			{ smoothTexture: { value: null } }
		);

		this.readWaterLevelShader = this.gpuCompute.createShaderMaterial(
			document.getElementById("readWaterLevelFragmentShader").textContent,
			{
				point1: { value: new THREE.Vector2() },
				levelTexture: { value: null }
			}
		);
		this.readWaterLevelShader.defines.WIDTH = WIDTH.toFixed(1);
		this.readWaterLevelShader.defines.BOUNDS = BOUNDS.toFixed(1);

		this.readWaterLevelImage = new Uint8Array(4 * 1 * 4);
		this.readWaterLevelRenderTarget = new THREE.WebGLRenderTarget(4, 1, {
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.UnsignedByteType,
			stencilBuffer: false,
			depthBuffer: false
		});

		//RESET VISCOSITY

		// setTimeout(()=>{
		// 	this.heightmapVariable.material.uniforms["viscosityConstant"] = {
		// 	value: 0.0
		// 	};
		// }, 500)
		// setTimeout(() => {
		// 	this.heightmapVariable.material.uniforms["viscosityConstant"] = {
		// 		value: effectController.viscosity
		// 	};
		// }, 1000);
	}

	fillTexture(texture) {
		var waterMaxHeight = 10;
		function noise(x, y) {
			var multR = waterMaxHeight;
			var mult = 0.025;
			var r = 0;
			for (var i = 0; i < 15; i++) {
				r += multR * simplex.noise2D(x * mult, y * mult);
				multR *= 0.53 + 0.025 * i;
				mult *= 1.25;
			}
			return r;
		}
		var pixels = texture.image.data;
		var p = 0;
		for (var j = 0; j < WIDTH; j++) {
			for (var i = 0; i < WIDTH; i++) {
				var x = i * 128 / WIDTH;
				var y = j * 128 / WIDTH;
				pixels[p + 0] = noise(x, y, 123.4);
				pixels[p + 1] = pixels[p + 0];
				pixels[p + 2] = 0;
				pixels[p + 3] = 1;
				p += 4;
			}
		}
	}

	render() {
		let deltaTime = this.clock.getDelta() * this.speedTime;
		this.time = this.time + deltaTime;

		for (let i = 0; i < this.blob.geometry.vertices.length; i++) {
			let v = this.blob.geometry.vertices[i];
			v
				.normalize()
				.multiplyScalar(
					1 +
						this.blob.material.uniforms.uAmplitude.value *
							simplex
								.noise4D(
									v.x * this.blob.material.uniforms.uFrequency.value,
									v.y * this.blob.material.uniforms.uFrequency.value,
									v.z * this.blob.material.uniforms.uFrequency.value,
									this.time
								)
								.map(-1, 1, 0, 1)
				);
		}

		this.blob.geometry.computeVertexNormals();
		this.blob.geometry.normalsNeedUpdate = true;
		this.blob.geometry.verticesNeedUpdate = true;

		let uniforms = this.heightmapVariable.material.uniforms;
		if (this.mouseMoved === true) {
			this.raycaster.setFromCamera(this.mouse, this.camera);
			let intersect = this.raycaster.intersectObject(this.shadowBlob)[0];
			if (intersect) {
				let uv = intersect.uv;
				let point = intersect.point;
				uv.x = (uv.x - 0.375) * 2 * 256;
				uv.y = (-uv.y + 0.5) * 2 * 256;

				uniforms["mousePos"].value.set(uv.x, uv.y);
			} else {
				uniforms["mousePos"].value.set(10000, 10000);
			}

			this.gpuCompute.compute();

			this.blob.material.uniforms.uTime.value = this.time;
			this.blob.material.uniforms.uHeightMap.value = this.gpuCompute.getCurrentRenderTarget(
				this.heightmapVariable
			).texture;
		}

		Boolean(this.isPostProcessingEnabled)
			? this.composer.render(this.clock.getDelta())
			: this.renderer.render(this.scene, this.camera);
	}

	valuesChanger() {
		this.heightmapVariable.material.uniforms["mouseSize"].value =
			effectController.mouseSize;
		this.heightmapVariable.material.uniforms["viscosityConstant"].value =
			effectController.viscosity;
	}

	onMouseMove(event) {
		if (!this.firstMove) {
			this.firstMove = true;
			this.heightmapVariable.material.uniforms["viscosityConstant"] = {
				value: 0.0
			};
			setTimeout(() => {
				this.heightmapVariable.material.uniforms["viscosityConstant"] = {
					value: effectController.viscosity
				};
			}, 100);
		}
		let x = event.clientX / window.innerWidth * 2 - 1;
		let y = -(event.clientY / window.innerHeight) * 2 + 1;
		
			TweenLite.to(this.lightBottom.position,0.75,{
				x : (x*1000)-600,
				y : (y*1000)-100
			})
			
			TweenLite.to(this.blob.rotation,0.25,{
				y: THREE.Math.degToRad(-45 + (x*25)),
				x: THREE.Math.degToRad(-y*25)
			})
		
		
		if (this.mouseDown === true) {

		} else {
			this.mouseMoved = true;
			this.mouse.x = x
			this.mouse.y = y
			

			
			// TweenLite.to(this.lightTop.position,0.75,{
			// 	x : (x*1000)-600,
			// 	y : (y*1000)-100
			// })

		}
	}

	onMouseDown(event) {
		this.mouseDown = true;
		TweenLite.to(this.blob.material.uniforms.uAmplitude, 2, {
			value: 0.5,
			ease: Elastic.easeOut.config(1, 0.3)
		});
		TweenLite.to(this.blob.material.uniforms.uFrequency, 0.5, {
			value: 2
		});
		TweenLite.to(this, 0.5, {
			speedTime: 2
		});
	}

	onMouseUp(event) {
		this.mouseDown = false;
		TweenLite.to(this.blob.material.uniforms.uAmplitude, 2, {
			value: 0.5,
			ease: Elastic.easeOut.config(1, 0.3)
		});
		TweenLite.to(this.blob.material.uniforms.uFrequency, 0.5, {
			value: 0.7
		});
		TweenLite.to(this, 0.5, {
			speedTime: 1
		});
	}

	addGUI() {
		this.gui = new dat.GUI();

		this.params = {
			postprocessing: {
				enabled: true,
				bloom: {
					blendFunction: PP.BlendFunction.SCREEN,
					resolutionScale: 1.0,
					kernelSize: PP.KernelSize.LARGE,
					distinction: 10,
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

		this.gui
			.add(effectController, "mouseSize", 1.0, 100.0, 1.0)
			.onChange(this.valuesChanger.bind(this));
		this.gui
			.add(effectController, "viscosity", 0.9, 0.999, 0.001)
			.onChange(this.valuesChanger.bind(this));

		//bloom
		let bloom = pp.addFolder("bloom");
		// bloom.open();

		this.bloomEffect.setResolutionScale(
			this.params.postprocessing.bloom.resolutionScale
		);
		bloom
			.add(this.params.postprocessing.bloom, "resolutionScale", 0.01, 1)
			.name("resolution")
			.onChange(value => {
				this.bloomEffect.setResolutionScale(value);
			})
			.listen();

		bloom
			.add(this.params.postprocessing.bloom, "kernelSize", PP.KernelSize)
			.name("kernel size")
			.onChange(value => {
				this.bloomEffect.kernelSize = value;
			});

		let luminance = bloom.addFolder("Luminance");
		// luminance.open();
		this.bloomEffect.distinction = this.params.postprocessing.bloom.distinction;
		luminance
			.add(this.params.postprocessing.bloom, "distinction", 1, 10)
			.name("distinction")
			.onChange(value => {
				this.bloomEffect.distinction = value;
			})
			.listen();

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
			.max(3)
			.step(0.001)
			.name("speed time")
			.listen();
		this.gui
			.add(this.blob.material.uniforms.uFrequency, "value")
			.min(0.01)
			.max(2)
			.step(0.01)
			.name("frequency")
			.listen();
		this.gui
			.add(this.blob.material.uniforms.uAmplitude, "value")
			.min(0)
			.max(2)
			.step(0.01)
			.name("amplitude")
			.listen();
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
		this.effectPass = new PP.EffectPass(this.camera, this.SMAAEffect);

		this.effectPass2 = new PP.EffectPass(
			this.chromaticAberrationEffect,
			this.bloomEffect,
			this.chromaticAberrationEffect
		);

		// this.noiseEffect.blendMode.opacity.value = 0.75;
		this.effectPass2.renderToScreen = true;

		this.composer.addPass(this.renderPass);
		this.composer.addPass(this.effectPass);
		this.composer.addPass(this.effectPass2);
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}

Number.prototype.map = function(in_min, in_max, out_min, out_max) {
	return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

const PP = POSTPROCESSING;

const simplex = new SimplexNoise();

//init app
const app = new App();

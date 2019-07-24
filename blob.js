Number.prototype.map = function(in_min, in_max, out_min, out_max) {
	return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

let Maf = function(obj) {
	if (obj instanceof Maf) return obj;
	if (!(this instanceof Maf)) return new Maf(obj);
	this._wrapped = obj;
};

Maf.mix = function(x, y, a) {
	if (a <= 0) return x;
	if (a >= 1) return y;
	return x + a * (y - x);
};

Maf.PI = Math.PI;
Maf.TAU = 2 * Maf.PI;

function pointsOnSphere(n) {
	const pts = [];
	const inc = Math.PI * (3 - Math.sqrt(5));
	const off = 2.0 / n;
	let r;
	var phi;
	let dmin = 10000;
	const prev = new THREE.Vector3();
	const cur = new THREE.Vector3();

	for (var k = 0; k < n; k++) {
		cur.y = k * off - 1 + off / 2;
		r = Math.sqrt(1 - cur.y * cur.y);
		phi = k * inc;
		cur.x = Math.cos(phi) * r;
		cur.z = Math.sin(phi) * r;

		const dist = cur.distanceTo(prev);
		if (dist < dmin) dmin = dist;

		pts.push(cur.clone());
		prev.copy(cur);
	}

	return pts;
}

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
		this.time = 0;
		this.clock = new THREE.Clock();
		this.simplex = new SimplexNoise();
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2(10000,10000);
		this.init();
		window.addEventListener("resize", this.onWindowResize.bind(this), false);
		window.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
	}

	init() {
		// renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio = window.devicePixelRatio;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setClearColor(0xffffff, 1);
		document.body.appendChild(this.renderer.domElement);

		// scene
		this.scene = new THREE.Scene();

		// camera
		this.camera = new THREE.PerspectiveCamera(
			40,
			window.innerWidth / window.innerHeight,
			1,
			10000
		);
		this.camera.position.set(3, 3, 3);

		// controls
		this.controls = new THREE.OrbitControls(
			this.camera,
			document.querySelector("canvas")
		);
		this.controls.enabled = true;
		this.controls.enablePan = false;

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
		this.scene.add(new THREE.AxesHelper(20));

		let geometry = new THREE.SphereBufferGeometry(0.5, 10, 10);
		this.sphereShadow = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({}));
		// this.scene.add(this.sphereShadow);

		this.numBlobs = 20;
		this.subtract = 12
		this.strength = 0.5
		this.amplitude = 0.25

		// loadModel({url:'https://rocheclement.fr/public/models/WaltHead.obj'})
		// .then((model)=>{
		// 	this.model = model.media
		// 	this.scene.add(this.model)
		// })
		
		let loader = new THREE.TextureLoader();
		loader.load('https://rocheclement.fr/public/textures/normals/gravel.jpg',
		(texture )=>{
			this.addBlobs(texture)
		})
		
		

		this.load().then(assets => {
			this.addPostProcessing(assets);
			this.isPostProcessingEnabled = false;

			this.addGUI();
		});

		//animation loop
		this.renderer.setAnimationLoop(this.render.bind(this));
	}
	
	addBlobs(texture) {
		this.resolution = 80;
		
		let standardShader = THREE.ShaderLib.standard;
		standardShader.uniforms.metalness.value = 0.0
		standardShader.uniforms.roughness.value = 0.8
		standardShader.uniforms.diffuse.value = [1.0,1.0,1.0]
		
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping  
		
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
				},
				uTexture: {
					value: texture
				}
			}
		]);
		
		
		
		let fragmentShader = standardShader.fragmentShader
		fragmentShader = document.querySelector("#fragmentShaderBeforeMain").textContent + fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );',document.querySelector("#fragmentShader").textContent)
		
		console.log(fragmentShader)
		
		let material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: document.querySelector("#vertexShader").textContent,
			fragmentShader: fragmentShader,
			lights: true,
			// color: 0xffffff,
			// metalness: 0.1,
			// roughness: 0.5
		});

		this.effect = new THREE.MarchingCubes(this.resolution, material, true, false);
		this.effect.position.set(0, 0, 0);
		// this.effect.scale.set( 100, 100, 100 );
		this.effect.enableUvs = false;
		this.effect.enableColors = false;
		this.effect.init(this.resolution);
		this.effect.isolation = 80;
		this.effect.castShadow = true;
		this.effect.receiveShadow = true;
		this.scene.add(this.effect);

		this.points = pointsOnSphere(this.numBlobs);
		this.points.forEach((point)=>{
			point.size = Math.random()
			point.random = Math.random()
		})
		
	}

	updateCubes(object, time, cohesion, strength, subtract) {
		object.reset();
		// fill the field with some metaballs
		var i, ballx, bally, ballz, subtract, strength;
		for (i = 0; i < this.numBlobs; i++) {
			let mX = this.simplex.noise2D(this.points[i].x*2,this.time)
			ballx = 0.5 + this.amplitude * mX * this.points[i].x;
			let mY = this.simplex.noise2D(this.points[i].y*2,this.time)
			bally = 0.5 + this.amplitude * mY * this.points[i].y;
			let mZ = this.simplex.noise2D(this.points[i].z*2,this.time)
			ballz = 0.5 + this.amplitude * mZ * this.points[i].z;
			
			// const c =
			// 	0.5 + 0.5 * Math.cos((cohesion + this.time + i / this.numBlobs) * Maf.TAU);
			// ballx = Maf.mix(0.5, ballx, c);
			// bally = Maf.mix(0.5, bally, c);
			// ballz = Maf.mix(0.5, ballz, c);
			let size = Math.abs(this.simplex.noise2D(this.points[i].size,this.time)).map(0,1,0.4,1) * (1- this.amplitude)
			object.addBall(ballx, bally, ballz, size , this.subtract);
		}
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
		this.time = this.time + this.clock.getDelta() * 0.25;
		
		// this.effect.rotation.x += 0.01
		
		this.raycaster.setFromCamera( this.mouse, this.camera );
		
		let intersect = this.raycaster.intersectObject( this.sphereShadow )[0];
		if(intersect) {
			TweenLite.to(this,1, {
				amplitude: 0.45
			})
			TweenLite.to(this,1, {
				subtract: 25
			})
		} else  {
			TweenLite.to(this,1, {
				amplitude: 0.25
			})
			TweenLite.to(this,1, {
				subtract: 12
			})
		}

		// const subtract = 12 - 10 * (.5+.5*Math.cos(this.time*Maf.TAU));
		const subtract = 12;
		const strength = 0.5; //.5 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );

		if(this.effect) {
			this.updateCubes(
				this.effect,
				this.time,
				0.5 + 0.5 * Math.sin(this.time * Maf.TAU),
				strength,
				subtract
			);
		}


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
		bloom.open();

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
		luminance.open();
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
		chroma.open();

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
		SMAA.open();

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
		
		this.gui.add(this,'amplitude',0,1,0.01).listen()
		this.gui.add(this,'numBlobs',5,30,1)
		this.gui.add(this,'strength',0,1,0.01).listen()
		this.gui.add(this,'subtract',1,25,1).listen()
	}
	
	onMouseMove( event ) {
		
		this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

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
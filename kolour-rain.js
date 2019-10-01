const PARAMS = {
    AMOUNT: 100,
    MAX_AMOUNT: 1000,
    SCALE_BASE: 0.5,
    SPEED_BASE: 1,
    ROTATIONSPEED_BASE: 0.03,
    RADIUS: 100,
    STRENGTH: 3
};

const gui = new dat.GUI();

gui
    .add(PARAMS, "RADIUS")
    .min(50)
    .max(200);

gui
    .add(PARAMS, "STRENGTH")
    .min(1)
    .max(5);

gui
    .add(PARAMS, "MAX_AMOUNT")
    .min(500)
    .max(10000);

class App extends PIXI.Application {
    constructor(parameters) {
        super(parameters);
    }

    loadTextures() {
        return new Promise((resolve, reject) => {
            if (!this.textures) {
                assetsToTextures(assets).then(textures => {
                    this.textures = textures;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    startRainingEffect() {
        this.loadTextures().then(this.createAssets.bind(this));
    }

    init() {
        this.mouse = vec2.fromValues(-1000, -1000);
        window.addEventListener("touchstart", this.onTouchStart.bind(this), false);
        window.addEventListener("touchmove", this.onTouchMove.bind(this), false);
        window.addEventListener("touchend", this.onTouchEnd.bind(this), false);
        window.addEventListener("mousemove", this.onMouseMove.bind(this), false);
        window.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        window.addEventListener("mouseup", this.onMouseUp.bind(this), false);
        document.addEventListener(
            "contextmenu",
            event => event.preventDefault(),
            false
        );
        let canvasElement = document.createElement("div");
        canvasElement.id = "canvas";
        document.body.appendChild(canvasElement);
        canvasElement.appendChild(this.view);
        this.resizeTo = canvasElement;
        this.ticker.add(delta => {
            if (this.mouseDown) {
                let randomTexture = this.textures[
                    Math.floor(Math.random() * this.textures.length)
                ];
                let position = vec2.create();
                vec2.add(
                    position,
                    this.mouseDown,
                    vec2.fromValues(
                        Math.random() * 100 * (Math.random() > 0.5 ? 1 : -1),
                        Math.random() * 100 * (Math.random() > 0.5 ? 1 : -1)
                    )
                );
                this.assets.push(new Asset(randomTexture, position));
                if (this.assets.length > PARAMS.MAX_AMOUNT) {
                    this.assets.shift().remove();
                }
            }
            if (this.assets) {
                this.assets.forEach(asset => {
                    asset.update();
                });
            }
        });

        return this;
    }

    createAssets() {
        this.assets = [];
        for (let i = 0; i < PARAMS.AMOUNT; i++) {
            let randomTexture = this.textures[
                Math.floor(Math.random() * this.textures.length)
            ];
            this.assets.push(new Asset(randomTexture));
        }
        gui
            .add(this.assets, "length")
            .listen()
            .name("assets amount");
    }

    onMouseMove(e) {
        // this.mouseVelocity = vec2.fromValues(
        //   1 + Math.abs(e.movementX) / 5,
        //   1 + Math.abs(e.movementY) / 5
        // );
        this.mouse = vec2.fromValues(e.clientX, e.clientY);
        if (this.mouseDown) this.mouseDown = this.mouse;
    }

    onMouseDown(e) {
        this.mouseDown = vec2.fromValues(e.clientX, e.clientY);
    }

    onMouseUp(e) {
        this.mouseDown = null;
    }

    onTouchStart(e) {
        if (e.touches[1]) {
            this.mouseDown = vec2.fromValues(
                e.touches[0].clientX,
                e.touches[0].clientY
            );
        }
    }

    onTouchMove(e) {
        this.mouse = vec2.fromValues(e.touches[0].clientX, e.touches[0].clientY);
        if (this.mouseDown) this.mouseDown = this.mouse;
    }

    onTouchEnd(e) {
        this.mouse = vec2.fromValues(-1000, -1000);
        this.mouseDown = null;
    }
}

class Asset {
    constructor(texture, position = null) {
        this.position = position;
        this.texture = texture;
        this.init();
    }

    init() {
        this.sprite = new PIXI.Sprite(this.texture);

        this.scale = PARAMS.SCALE_BASE + Math.random() / 10;

        this.size = vec2.fromValues(
            this.texture.baseTexture.width * this.scale,
            this.texture.baseTexture.height * this.scale
        );

        this.position =
            this.position ||
            vec2.fromValues(
                app.screen.width * Math.random(),
                -(app.screen.height + this.size[1] * 10) * Math.random() -
                this.size[1] / 2
            );
        this.speed = vec2.fromValues(0, PARAMS.SPEED_BASE + Math.random() / 2);
        this.rotation = Math.random() * 360;
        this.rotationSpeed = PARAMS.ROTATIONSPEED_BASE + Math.random() / 100;

        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        app.stage.addChild(this.sprite);
    }

    update() {
        // this.size = vec2.fromValues(
        //   this.texture.baseTexture.width,
        //   this.texture.baseTexture.height
        // );

        vec2.add(this.position, this.position, this.speed);

        if (vec2.distance(this.position, app.mouse) < PARAMS.RADIUS) {
            let v = vec2.create();
            vec2.subtract(v, this.position, app.mouse);
            // // let v = vec2.fromValues(0, 0);
            vec2.normalize(v, v);
            // // vec2.multiply(v,v,app.mouseVelocity)
            vec2.multiply(v, v, vec2.fromValues(PARAMS.STRENGTH, PARAMS.STRENGTH));
            vec2.add(this.position, this.position, v);
            this.rotation += this.rotationSpeed;
        }

        if (this.position[1] - this.size[1] > app.screen.height) {
            this.position = vec2.fromValues(
                app.screen.width * Math.random(),
                -(app.screen.height + this.size[1] * 10) * Math.random() -
                this.size[1] / 2
            );
        }
        this.sprite.x = this.position[0];
        this.sprite.y = this.position[1];

        this.sprite.scale.x = this.scale;
        this.sprite.scale.y = this.scale;

        this.sprite.rotation = this.rotation;
    }

    remove() {
        app.stage.removeChild(this.sprite);
    }
}

const assets = [
    "https://uploads-ssl.webflow.com/5b67e2c8dc6fa8e26712d6d5/5d932cebe2a4d96df9b1ccef_ass3.svg",
    "https://uploads-ssl.webflow.com/5b67e2c8dc6fa8e26712d6d5/5d932e18160832112f05ac31_ass11.svg",
    "https://uploads-ssl.webflow.com/5b67e2c8dc6fa8e26712d6d5/5d932c7d67afa8599ad186fa_ass5.svg",
    "https://uploads-ssl.webflow.com/5b67e2c8dc6fa8e26712d6d5/5d932c78e2f2d377b0117e0c_ass2.svg"
   
];

function assetsToTextures(assets) {
    const loader = new PIXI.Loader();
    const textures = [];
    assets.forEach((asset, index) => {
        loader.add(index.toString(), asset);
    });
    loader.load((loader, resources) => {});
    return new Promise((resolve, reject) => {
        loader.onComplete.add((loader, resources) => {
            Object.keys(resources).forEach(key => {
                let resource = resources[key];
                textures.push(resource.texture);
                resolve(textures);
            });
        });
    });
}

let app = new App({
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: true,
    resolution: window.devicePixelRatio || 1,
    resizeTo: window,
    // antialias: true,
    forceFXAA: true,
    powerPreference: "high-performance"
});

app.init().startRainingEffect();

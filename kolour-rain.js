const PARAMS={AMOUNT:100,MAX_AMOUNT:180,SCALE_BASE:.3,SPEED_BASE:1,ROTATIONSPEED_BASE:.03,RADIUS:100,STRENGTH:3},gui=new dat.GUI;gui.add(PARAMS,"RADIUS").min(50).max(200),gui.add(PARAMS,"STRENGTH").min(1).max(5),gui.add(PARAMS,"MAX_AMOUNT").min(500).max(1e4);class App extends PIXI.Application{constructor(e){super(e)}loadTextures(){return new Promise((e,t)=>{this.textures?e():assetsToTextures(assets).then(t=>{this.textures=t,e()})})}startRainingEffect(){this.loadTextures().then(this.createAssets.bind(this))}init(){this.mouse=vec2.fromValues(-1e3,-1e3),window.addEventListener("touchstart",this.onTouchStart.bind(this),!1),window.addEventListener("touchmove",this.onTouchMove.bind(this),!1),window.addEventListener("touchend",this.onTouchEnd.bind(this),!1),window.addEventListener("mousemove",this.onMouseMove.bind(this),!1),window.addEventListener("mousedown",this.onMouseDown.bind(this),!1),window.addEventListener("mouseup",this.onMouseUp.bind(this),!1),document.addEventListener("contextmenu",e=>e.preventDefault(),!1);let e=document.createElement("div");return e.id="canvas",document.body.appendChild(e),e.appendChild(this.view),this.resizeTo=e,this.ticker.add(e=>{if(this.mouseDown){let e=this.textures[Math.floor(Math.random()*this.textures.length)],t=vec2.create();vec2.add(t,this.mouseDown,vec2.fromValues(100*Math.random()*(Math.random()>.5?1:-1),100*Math.random()*(Math.random()>.5?1:-1))),this.assets.push(new Asset(e,t)),this.assets.length>PARAMS.MAX_AMOUNT&&this.assets.shift().remove()}this.assets&&this.assets.forEach(e=>{e.update()})}),this}createAssets(){this.assets=[];for(let e=0;e<PARAMS.AMOUNT;e++){let e=this.textures[Math.floor(Math.random()*this.textures.length)];this.assets.push(new Asset(e))}gui.add(this.assets,"length").listen().name("assets amount")}onMouseMove(e){this.mouse=vec2.fromValues(e.clientX,e.clientY),this.mouseDown&&(this.mouseDown=this.mouse)}onMouseDown(e){this.mouseDown=vec2.fromValues(e.clientX,e.clientY)}onMouseUp(e){this.mouseDown=null}onTouchStart(e){e.touches[1]&&(this.mouseDown=vec2.fromValues(e.touches[0].clientX,e.touches[0].clientY))}onTouchMove(e){this.mouse=vec2.fromValues(e.touches[0].clientX,e.touches[0].clientY),this.mouseDown&&(this.mouseDown=this.mouse)}onTouchEnd(e){this.mouse=vec2.fromValues(-1e3,-1e3),this.mouseDown=null}}class Asset{constructor(e,t=null){this.position=t,this.texture=e,this.init()}init(){this.sprite=new PIXI.Sprite(this.texture),this.scale=PARAMS.SCALE_BASE+Math.random()/10,this.size=vec2.fromValues(this.texture.baseTexture.width*this.scale,this.texture.baseTexture.height*this.scale),this.position=this.position||vec2.fromValues(app.screen.width*Math.random(),-(app.screen.height+10*this.size[1])*Math.random()-this.size[1]/2),this.speed=vec2.fromValues(0,PARAMS.SPEED_BASE+Math.random()/2),this.rotation=360*Math.random(),this.rotationSpeed=PARAMS.ROTATIONSPEED_BASE+Math.random()/100,this.sprite.anchor.x=.5,this.sprite.anchor.y=.5,app.stage.addChild(this.sprite)}update(){if(vec2.add(this.position,this.position,this.speed),vec2.distance(this.position,app.mouse)<PARAMS.RADIUS){let e=vec2.create();vec2.subtract(e,this.position,app.mouse),vec2.normalize(e,e),vec2.multiply(e,e,vec2.fromValues(PARAMS.STRENGTH,PARAMS.STRENGTH)),vec2.add(this.position,this.position,e),this.rotation+=this.rotationSpeed}this.position[1]-this.size[1]>app.screen.height&&(this.position=vec2.fromValues(app.screen.width*Math.random(),-(app.screen.height+10*this.size[1])*Math.random()-this.size[1]/2)),this.sprite.x=this.position[0],this.sprite.y=this.position[1],this.sprite.scale.x=this.scale,this.sprite.scale.y=this.scale,this.sprite.rotation=this.rotation}remove(){app.stage.removeChild(this.sprite)}}const assets=["https://rocheclement.fr/public/images/kolour/1.svg","https://rocheclement.fr/public/images/kolour/2.svg","https://rocheclement.fr/public/images/kolour/3.svg","https://rocheclement.fr/public/images/kolour/4.svg","https://rocheclement.fr/public/images/kolour/5.svg","https://rocheclement.fr/public/images/kolour/6.svg","https://rocheclement.fr/public/images/kolour/7.svg","https://rocheclement.fr/public/images/kolour/8.svg","https://rocheclement.fr/public/images/kolour/9.svg","https://rocheclement.fr/public/images/kolour/10.svg"];function assetsToTextures(e){const t=new PIXI.Loader,s=[];return e.forEach((e,s)=>{t.add(s.toString(),e)}),t.load((e,t)=>{}),new Promise((e,i)=>{t.onComplete.add((t,i)=>{Object.keys(i).forEach(t=>{let o=i[t];s.push(o.texture),e(s)})})})}let app=new App({width:window.innerWidth,height:window.innerHeight,transparent:!0,resolution:window.devicePixelRatio||1,resizeTo:window,forceFXAA:!0,powerPreference:"high-performance"});app.init().startRainingEffect();

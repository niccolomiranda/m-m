class App{constructor(){document.querySelector("#scroll")&&this.init(),window.addEventListener("resize",this.onResize.bind(this))}init(){this.envTest(),this.initWebGL(),this.initJsScroll(),this.initGalleries(),window.addEventListener("DOMContentLoaded",this.initImageEffect.bind(this))}initJsScroll(){this.jsScrollElement=document.getElementById("scroll"),this.jsScrollContainerElement=document.getElementById("scroll-container"),this.scrollbarElement=document.getElementById("scroll-scrollbar"),this.scrollbarThumbElement=document.getElementById("scroll-scrollbar-thumb"),this.jsScrollElement&&this.jsScrollContainerElement&&this.scrollbarElement&&this.scrollbarThumbElement?this.jsScrollElement.addEventListener("wheel",this.onWheel.bind(this)):document.body.classList.add("js-scroll-disabled")}scroll(){this.jsScrollTween=TweenMax.to(this.jsScrollContainerElement.children,SCROLL_DURATION,{y:this.deltaY,ease:SCROLL_EASING,onUpdate:()=>{this.imagePlanesCalibration()}}),this.scrollbarTween=TweenMax.to(this.scrollbarThumbElement,SCROLL_DURATION,{y:this.thumbDeltaY,ease:SCROLL_EASING}),this.imagePlanes&&this.imagePlanes.forEach(t=>{let e=new TimelineMax;e.to(t.material.uniforms.uMousePosition.value,1,{x:0,y:0}),t.material.uniforms.uMouseMoveStrength.value<3&&(e.to(t.material.uniforms.uMouseMoveStrength,1,{value:3},0),e.to(t.material.uniforms.uMouseMoveStrength,1,{value:0},1))})}onWheel(t){if(!this.fullScreenOpened){if(!t.deltaY)return;let e=-t.deltaY*(this.isFirefox?FIREFOX_MULTIPLIER:1)*SCROLL_STRENGTH;this.deltaY?this.deltaY+=e:this.deltaY=e,this.deltaY=Math.min(Math.max(this.maxDeltaY,this.deltaY),0),this.scroll()}}onResize(){this.envTest(),this.imagePlanesCalibration(),this.fullscreenImageCallibration(),this.camera.aspect=window.innerWidth/window.innerHeight,this.camera.updateProjectionMatrix(),this.renderer.setSize(window.innerWidth,window.innerHeight)}envTest(){this.isMobile?document.body.classList.add("mobile"):document.body.classList.remove("mobile"),this.isFirefox?document.body.classList.add("firefox"):document.body.classList.remove("firefox")}initWebGL(){this.clock=new THREE.Clock,this.renderer=new THREE.WebGLRenderer({alpha:!0,antialias:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),this.renderer.setSize(window.innerWidth,window.innerHeight),document.querySelector("#canvas").appendChild(this.renderer.domElement),this.scene=new THREE.Scene,this.camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,.1,1e4),this.camera.position.z=50,this.camera.lookAt=this.scene.position,this.renderer.setAnimationLoop(this.render.bind(this))}render(){this.time=(this.time?this.time:0)+this.clock.getDelta(),this.imagePlanes&&this.imagePlanes.forEach(t=>{t.material.uniforms.uTime.value=this.time}),this.renderer.render(this.scene,this.camera)}initImageEffect(){return this.scrollEffectImages=document.querySelectorAll("#scroll .scroll-effect img"),this.imagePlanes=[],!!this.scrollEffectImages[0]&&(this.scrollEffectImages.forEach(t=>{let e=t.getBoundingClientRect(),i=e.width/e.height,n=new THREE.PlaneGeometry(i,1,32,32),s=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uTexture:{value:(new THREE.TextureLoader).load(t.src)},uMousePosition:{value:new THREE.Vector2(0,0)},uResolution:{value:new THREE.Vector2(window.devicePixelRatio*e.width,window.devicePixelRatio*e.height)},uMouseMoveStrength:{value:0}},vertexShader:"\n\t\t\t\t\tuniform vec2 uResolution;\n\t\t\t\t\tuniform vec2 uMousePosition;\n\t\t\t\t\tuniform float uTime;\n\t\t\t\t\tuniform float uMouseMoveStrength;\n\t\t\t\t\t\n\t\t\t\t\tvarying vec2 vUv;\n\t\t\t\t\tvarying vec3 vVertexPosition;\n\t\t\t\t\tvarying float d;\n\n\t\t\t\t\tvoid main() {\n\t\t\t\t\t\tvUv = uv;\n\t\t\t\t\t\tvec3 vertexPosition = position;\n\n\t\t\t\t\t\tfloat resolution = uResolution.x / uResolution.y;\n\t\t\t\t\t\tfloat distanceFromMouse = distance(uMousePosition, vec2(vertexPosition.x * resolution, vertexPosition.y));\n\t\t\t\t\t\td = distanceFromMouse;\n\n\t\t\t\t\t\tfloat waveSinusoid = cos(5. * (distanceFromMouse - uTime));\n\n\t\t\t\t\t\tfloat distanceStrength = (0.4 / (distanceFromMouse + 0.4));\n\n\t\t\t\t\t\tfloat distortionEffect = distanceStrength * waveSinusoid * uMouseMoveStrength;\n\n\t\t\t\t\t\tvertexPosition.z += distortionEffect / 15.0;\n\t\t\t\t\t\tvertexPosition.x += distortionEffect / 15.0 * (uMousePosition.x - vertexPosition.x);\n\t\t\t\t\t\tvertexPosition.y += distortionEffect / 15.0 * (uMousePosition.y - vertexPosition.y);\n\n\t\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( vertexPosition, 1.0 );\n\n\t\t\t\t\t\tvVertexPosition = vertexPosition;\n\t\t\t\t\t}\n\t\t\t\t",fragmentShader:"\n\t\t\t\t\tuniform sampler2D uTexture;\n\n\t\t\t\t\tvarying vec2 vUv;\n\t\t\t\t\tvarying vec3 vVertexPosition;\n\t\t\t\t\tvarying float d;\n\n\t\t\t\t\tvoid main() {\n\t\t\t\t\t\tvec4 color = texture2D(uTexture,vUv);\n\n\t\t\t\t\t\tcolor.rgb -= clamp(-vVertexPosition.z, 0.0, 1.0);\n\n\t\t\t\t\t\tcolor.rgb += clamp(vVertexPosition.z, 0.0, 1.0);\n\n\t\t\t\t\t\tcolor = vec4(color.rgb * color.a, color.a);\n\t\t\t\t\t\t\n\t\t\t\t\t\tgl_FragColor = color;\n\t\t\t\t\t}\n\t\t\t\t"}),r=new THREE.Mesh(n,s);this.scene.add(r),r.image=t,r.ratio=i,this.imagePlanes.push(r),t.addEventListener("click",t=>{let i=t.offsetX/e.width*2-1,n=-t.offsetY/e.height*2+1,s=new TimelineMax;s.to(r.material.uniforms.uMousePosition.value,1,{x:i,y:n}),s.to(r.material.uniforms.uMouseMoveStrength,1,{value:3},0),s.to(r.material.uniforms.uMouseMoveStrength,1,{value:0},1)})}),this.imagePlanesCalibration(),!0)}imagePlanesCalibration(){return!!this.imagePlanes[0]&&(this.imagePlanes.forEach(t=>{let e=t.image.getBoundingClientRect(),i=(t.ratio,e.width*this.viewSize.width/window.innerWidth),n=e.height*this.viewSize.height/window.innerHeight;t.scale.x=n,t.scale.y=n;let s=e.left*this.viewSize.width/window.innerWidth-this.viewSize.width/2+i/2,r=-(e.top*this.viewSize.height/window.innerHeight-this.viewSize.height/2)-n/2;t.position.x=s,t.position.y=r}),!0)}initGalleries(){if(this.galleryElements=document.querySelectorAll(".p-gallery .p-grid"),this.galleryImageElements=document.querySelectorAll(".p-gallery .p-grid img"),!this.galleryElements[0]||!this.galleryImageElements[0])return!1;window.addEventListener("click",()=>{this.fullScreenOpened&&this.closeFullscreen()});let t={uProgress:new THREE.Uniform(0),uMeshScale:new THREE.Uniform(new THREE.Vector2(1,1)),uMeshPosition:new THREE.Uniform(new THREE.Vector2(0,0)),uViewSize:new THREE.Uniform(1),uTexture:new THREE.Uniform(null),uImageRes:new THREE.Uniform(new THREE.Vector2(0,0))},e=new THREE.PlaneBufferGeometry(1,1,64,64),i=new THREE.ShaderMaterial({uniforms:t,vertexShader:"\n\t\t\t\t\tuniform float uProgress;\n\t\t\t\t\tuniform vec2 uMeshScale;\n\t\t\t\t\tuniform vec2 uMeshPosition;\n\t\t\t\t\tuniform float uViewSize;\n\n\t\t\t\t\tvarying vec2 vUv;\n\t\t\t\t\tvarying vec2 scale;\n\n\t\t\t\t\tfloat getActivation(vec2 uv){\n\t\t\t\t\t\tfloat maxDistance = distance(vec2(0.),vec2(0.5));\n\t\t\t\t\t\tfloat dist = distance(vec2(0.), uv-0.5);\n\t\t\t\t\t\treturn smoothstep(0.,maxDistance,dist);\n\t\t\t\t\t}\n\n\t\t\t\t\tfloat linearStep(float edge0, float edge1, float val) {\n\t\t\t\t\t\tfloat x = clamp( (val  - edge0) / (edge1 - edge0),0.,1.);\n\t\t\t\t\t\t\treturn x;\n\t\t\t\t\t}\n\n\t\t\t\t\tvoid main(){\n\t\t\t\t\t\tvec3 pos = position.xyz;\n\t\t\t\t\t\tvec2 newUV = uv;\n\n\t\t\t\t\t\tfloat activation = getActivation(uv);\n\n\t\t\t\t\t\tvec3 transformedPos = pos;\n\t\t\t\t\t\tvec2 transformedUV = uv;\n\n\t\t\t\t\t\tfloat latestStart = 0.5;\n\t\t\t\t\t\tfloat startAt = activation * latestStart;\n\t\t\t\t\t\tfloat vertexProgress = smoothstep(startAt,1.,uProgress);\n\n\t\t\t\t\t\tfloat limit = 0.5;\n\t\t\t\t\t\tfloat wavyProgress = min(clamp((vertexProgress) / limit,0.,1.),clamp((1.-vertexProgress) / (1.-limit),0.,1.));\n\n\t\t\t\t\t\tfloat dist = length(transformedPos.xy);\n\n\t\t\t\t\t\tfloat angle = atan(transformedPos.x,transformedPos.y);\n\n\t\t\t\t\t\tfloat nextDist = dist * (1. * (sin(angle * 0.1 + 8000.) /2.+0.5)+ 1.);\n\n\t\t\t\t\t\ttransformedPos.x = mix(transformedPos.x,sin(angle) * nextDist ,  wavyProgress);\n\t\t\t\t\t\ttransformedPos.y = mix(transformedPos.y,cos(angle) * nextDist,  wavyProgress);\n\n\t\t\t\t\t\t  pos = transformedPos;\n\t\t\t\t\t\t  newUV = transformedUV; \n\n\t\t\t\t\t\t// Scale to page view size/page size\n\t\t\t\t\t\tvec2 scaleToViewSize = uViewSize / uMeshScale - 1.;\n\t\t\t\t\t\t// vec2 scaleToViewSize = uMeshScale;\n\t\t\t\t\t\tscale = vec2(\n\t\t\t\t\t\t\t1. + scaleToViewSize * vertexProgress\n\t\t\t\t\t\t);\n\t\t\t\t\t\tpos.xy *= scale;\n\n\t\t\t\t\t\t// Move towards center \n\t\t\t\t\t\tpos.y += -uMeshPosition.y * vertexProgress;\n\t\t\t\t\t\tpos.x += -uMeshPosition.x * vertexProgress;\n\n\t\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);\n\t\t\t\t\t\tvUv = newUV;\n\t\t\t\t\t}\n\t\t\t\t",fragmentShader:"\n\t\t\t\t\tuniform sampler2D uTexture;\n\t\t\t\t\tuniform vec2 uMeshScale;\n\t\t\t\t\tuniform vec2 uImageRes;\n\n\t\t\t\t\tvarying vec2 vUv;\n\t\t\t\t\tvarying vec2 scale;\n\n\t\t\t\t\tvec2 preserveAspectRatioSlice(vec2 uv, vec2 planeSize, vec2 imageSize ){\n\n\t\t\t\t\tvec2 ratio = vec2(\n\t\t\t\t\t\t\t\tmin((planeSize.x / planeSize.y) / (imageSize.x / imageSize.y), 1.0),\n\t\t\t\t\t\t\t\tmin((planeSize.y / planeSize.x) / (imageSize.y / imageSize.x), 1.0)\n\t\t\t\t\t\t  );\n\n\n\t\t\t\t\tvec2 sliceUvs = vec2(\n\t\t\t\t\t\t\t\tuv.x * ratio.x + (1.0 - ratio.x) * 0.5,\n\t\t\t\t\t\t\t\tuv.y * ratio.y + (1.0 - ratio.y) * 0.5\n\t\t\t\t\t\t  );\n\n\t\t\t\t\t\treturn sliceUvs;\n\t\t\t\t\t}\n\n\t\t\t\t\tvoid main(){\n\t\t\t\t\t\tvec2 uv = vUv;\n\t\t\t\t\t\tvec2 scaledPlane = uMeshScale * scale;\n\n\t\t\t\t\t\tvec2 smallImageUV = preserveAspectRatioSlice(uv, scaledPlane, uImageRes);\n\n\t\t\t\t\t\tvec3 color = texture2D(uTexture,uv).xyz;\n\n\t\t\t\t\t\tgl_FragColor = vec4(color,1.);\n\t\t\t\t\t}\n\t\t\t\t"});this.galleryMesh=new THREE.Mesh(e,i),this.galleryMesh.position.z=.02,this.galleryMesh.visible=!1,this.scene.add(this.galleryMesh);let n=new THREE.MeshBasicMaterial({color:0,transparent:!0,opacity:0});this.blurMesh=new THREE.Mesh(e,n),this.scene.add(this.blurMesh),this.blurMesh.scale.set(200,200,200),this.blurMesh.position.z=.01,this.createGalleriesImages()}fullscreenImageCallibration(){if(this.currentFullscreenImage){let t=this.currentFullscreenImage.getBoundingClientRect(),e=this.viewSize;this.galleryMesh.material.uniforms.uViewSize.value=e.height;let i=t.width*e.width/window.innerWidth,n=t.height*e.height/window.innerHeight,s=t.left*e.width/window.innerWidth,r=t.top*e.height/window.innerHeight,o=(s-=e.width/2)+i/2,l=-(r-=e.height/2)-n/2;this.galleryMesh.scale.x=i,this.galleryMesh.scale.y=n,this.galleryMesh.position.x=o,this.galleryMesh.position.y=l,this.galleryMesh.material.uniforms.uMeshPosition.value.x=o/i,this.galleryMesh.material.uniforms.uMeshPosition.value.y=l/n,i*=1.1,n*=1.1;let a=window.innerHeight/window.innerWidth,h=t.height/t.width;h>1||h>a?(this.galleryMesh.material.uniforms.uMeshScale.value.x=n,this.galleryMesh.material.uniforms.uMeshScale.value.y=n,this.galleryMesh.material.uniforms.uViewSize.value=e.height):(this.galleryMesh.material.uniforms.uMeshScale.value.x=i,this.galleryMesh.material.uniforms.uMeshScale.value.y=i,this.galleryMesh.material.uniforms.uViewSize.value=e.width)}}createGalleriesImages(){this.galleryImageElements.forEach(t=>{let e=(new THREE.TextureLoader).load(t.src);t.texture=e,t.addEventListener("click",()=>{if(!this.fullScreenOpened){this.currentFullscreenImage=t;let e=this.currentFullscreenImage.getBoundingClientRect();this.viewSize;this.galleryMesh.material.uniforms.uTexture.value=t.texture,this.galleryMesh.material.uniforms.uImageRes.value.x=e.width,this.galleryMesh.material.uniforms.uImageRes.value.y=e.height,this.fullscreenImageCallibration(),this.openFullscreen()}})})}openFullscreen(){TweenLite.to(this.galleryMesh.material.uniforms.uProgress,2,{value:1,ease:Power4.easeOut,onStart:()=>{this.jsScrollTween&&this.jsScrollTween.kill(),this.scrollbarTween&&this.scrollbarTween.kill(),this.fullScreenOpened=!0,this.galleryMesh.visible=!0,document.body.classList.add("fullscreen"),this.imagePlanes&&this.imagePlanes.forEach(t=>{t.visible=!1})}}),TweenLite.to(this.blurMesh.material,2,{opacity:.8,ease:Power4.easeOut})}closeFullscreen(){this.fullScreenClosingAnimationTween||(this.fullScreenClosingAnimationTween=TweenLite.to(this.galleryMesh.material.uniforms.uProgress,1,{value:0,ease:Power4.easeOut,onComplete:()=>{this.fullScreenOpened=!1,this.galleryMesh.visible=!1,this.fullScreenClosingAnimationTween=null,this.imagePlanes&&this.imagePlanes.forEach(t=>{t.visible=!0}),setTimeout(()=>{document.body.classList.remove("fullscreen")},10)}}),TweenLite.to(this.blurMesh.material,1,{opacity:0,ease:Power4.easeOut}))}get viewSize(){let t=this.camera.fov*Math.PI/180,e=Math.abs(this.camera.position.z*Math.tan(t/2)*2);return{width:e*this.camera.aspect,height:e}}get viewHeight(){return this.jsScrollElement.offsetHeight}get maxDeltaY(){return-this.jsScrollContainerElement.offsetHeight+this.viewHeight}get maxThumbDeltaY(){return this.viewHeight-this.scrollbarThumbElement.offsetHeight}get thumbDeltaY(){let t=this.maxThumbDeltaY-this.deltaY.map(this.maxDeltaY,0,0,this.maxThumbDeltaY);return Math.min(Math.max(0,t),this.maxThumbDeltaY)}get isFirefox(){return navigator.userAgent.includes("Firefox")}get isMobile(){return/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}}Number.prototype.map=function(t,e,i,n){return(this-t)*(n-i)/(e-t)+i};const FIREFOX_MULTIPLIER=33,SCROLL_STRENGTH=1,SCROLL_DURATION=1,SCROLL_EASING=Power4.easeOut,app=new App;

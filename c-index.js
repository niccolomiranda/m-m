Number.prototype.map=function(e,t,o,l){return(this-e)*(l-o)/(t-e)+o};let isMobile=/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);const isFIREFOX=navigator.userAgent.includes("Firefox"),firefoxMultiplier=33,scrollStrength=1,scrollDuration=1,scrollEasing=Power4.easeOut,jsScroll=document.querySelector("#scroll"),jsScrollContainer=document.querySelector("#scroll-container"),scrollbar=document.querySelector("#scroll-scrollbar"),scrollbarThumb=document.querySelector("#scroll-scrollbar-thumb");let scrollbarThumbHeight,maxDeltaY,touchPosition,HEIGHT,curtains,planeElements,deltaY=0,delta={y:0,x:0},mouseDown=!1,touchStart=!1,planes=[];function initCurtain(){curtains=new Curtains("canvas"),(planeElements=document.querySelectorAll(".scroll-effect")).forEach((e,t)=>{let o=curtains.addPlane(e,{vertexShaderID:"plane-vs",fragmentShaderID:"plane-fs",widthSegments:20,heightSegments:20,uniforms:{time:{name:"uTime",type:"1f",value:0},multiplicator:{name:"uMultiplicator",type:"1f",value:0},mousePosition:{name:"uMousePosition",type:"2f",value:[0,0]},resolution:{name:"uResolution",type:"2f",value:[0,0]},mouseMoveStrength:{name:"uMouseMoveStrength",type:"1f",value:0}}});o&&(planes.push(o),o.uniforms.resolution.value=[window.devicePixelRatio*e.clientWidth,window.devicePixelRatio*e.clientHeight],e.addEventListener("click",t=>{let l=t.offsetX/e.clientWidth*2-1,n=-t.offsetY/e.clientHeight*2+1,i=new TimelineMax;i.to(o.uniforms.mouseMoveStrength,1,{value:3}),i.to(o.uniforms.mouseMoveStrength,1,{value:0}),TweenMax.to(o.uniforms.mousePosition.value,1,{0:l,1:n})}),o.onRender(()=>{o.uniforms.time.value+=.015}))})}function init(){HEIGHT=jsScroll.offsetHeight,scrollbarThumbHeight=100-jsScrollContainer.offsetHeight/HEIGHT,maxDeltaY=-jsScrollContainer.offsetHeight+HEIGHT,(isMobile=/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))&&document.body.classList.add("is-mobile"),scroll()}function onWheel(e){let t=-e.deltaY*(isFIREFOX?firefoxMultiplier*scrollStrength:1*scrollStrength);deltaY+=t,scroll()}function scroll(){deltaY=Math.min(Math.max(maxDeltaY,deltaY),0),TweenMax.to(delta,scrollDuration,{y:deltaY,ease:scrollEasing,onUpdate:()=>{planes.forEach(e=>{e.setRelativePosition(e.relativeTranslation.x,delta.y,e.relativeTranslation.z)})}}),TweenMax.to(jsScrollContainer,scrollDuration,{y:deltaY,ease:scrollEasing}),planes.forEach(e=>{if(TweenMax.to(e.uniforms.mousePosition.value,1,{0:0,1:0}),e.uniforms.mouseMoveStrength.value<3){let t=new TimelineMax;t.to(e.uniforms.mouseMoveStrength,1,{value:3}),t.to(e.uniforms.mouseMoveStrength,1,{value:0})}});let e=HEIGHT-scrollbarThumb.offsetHeight,t=e-deltaY.map(maxDeltaY,0,0,e);t=Math.min(Math.max(0,t),e),TweenMax.to(scrollbarThumb,scrollDuration,{y:t,ease:scrollEasing})}jsScroll.addEventListener("wheel",onWheel),window.addEventListener("resize",init),window.addEventListener("DOMContentLoaded",function(){init(),initCurtain()});
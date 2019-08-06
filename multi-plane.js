Number.prototype.map = function(in_min, in_max, out_min, out_max) {
	return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

let isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
	navigator.userAgent
);
const isFIREFOX = navigator.userAgent.includes("Firefox");
const firefoxMultiplier = 33;

const scrollStrength = 1;
const scrollDuration = 1;
const scrollEasing = Power4.easeOut;

const jsScroll = document.querySelector("#scroll");
const jsScrollContainer = document.querySelector("#scroll-container");
const scrollbar = document.querySelector("#scroll-scrollbar");
const scrollbarThumb = document.querySelector("#scroll-scrollbar-thumb");

let scrollbarThumbHeight;
let maxDeltaY;
let deltaY = 0;

let delta = {
	y:0,
	x:0
}

let mouseDown = false;
let touchStart = false;
let touchPosition;

let HEIGHT;

let planes = []
let curtains;
let planeElements;
let planeElementsParams;

function initCurtain() {
	curtains = new Curtains("canvas");
	planeElements = document.querySelectorAll(".scroll-effect");
	planeElementsParams = {
		vertexShaderID: "plane-vs",
		fragmentShaderID: "plane-fs",
		widthSegments: 100,
		heightSegments: 100,
		uniforms: {
			time: {
				name: "uTime",
				type: "1f",
				value: 0
			},
			multiplicator: {
				name:"uMultiplicator",
				type: "1f",
				value:0
			},
         mousePosition: {
            name: "uMousePosition",
            type: "2f",
         	value: [0, 0],
         },
			resolution: {
				name: "uResolution",
				type: "2f",
				value: [0,0],
         },
         mouseMoveStrength: {
				name: "uMouseMoveStrength",
				type: "1f",
				value: 0,
         }
		}
	}
	planeElements.forEach((planeElement,index)=>{
		let plane = curtains.addPlane(planeElement, planeElementsParams);
		if (plane) {
			planes.push(plane)
			plane.uniforms.resolution.value = [window.devicePixelRatio * planeElement.clientWidth, window.devicePixelRatio * planeElement.clientHeight]
			plane.onRender(() => {
				plane.uniforms.time.value+=0.015;
			});
		}
	})
}

function init() {
	HEIGHT = jsScroll.offsetHeight;
	scrollbarThumbHeight =
		100 - jsScrollContainer.offsetHeight / HEIGHT;
	maxDeltaY = -jsScrollContainer.offsetHeight + HEIGHT;
	isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	);
	isMobile ? document.body.classList.add("is-mobile") : null;
	scroll();
}

function onWheel(e) {
	// console.log(e.deltaY)
	let delta =
		-e.deltaY *
		(isFIREFOX ? firefoxMultiplier * scrollStrength : 1 * scrollStrength);

	deltaY += delta;

	scroll();
}

function scroll() {
	deltaY = Math.min(Math.max(maxDeltaY, deltaY), 0);
	TweenMax.to(delta, scrollDuration, {
		y: deltaY,
		ease: scrollEasing,
		onUpdate:()=>{
			planes.forEach((plane)=>{
plane.setRelativePosition(plane.relativeTranslation.x,delta.y,plane.relativeTranslation.z)
			})
		}
	});
	TweenMax.to(jsScrollContainer, scrollDuration, {
		y: deltaY,
		ease: scrollEasing
	});
	planes.forEach((plane)=>{
		// let multiplicator = Math.sign(e.deltaY)*(Math.abs(-e.deltaY)*0.01)*30
		let multiplicator = 3;
		if(plane.uniforms.mouseMoveStrength.value < 3) {
			let tl = new TimelineMax()
			tl.to([plane.uniforms.mouseMoveStrength,plane.uniforms.multiplicator],1,{
				value:multiplicator
			})
			tl.to([plane.uniforms.mouseMoveStrength,plane.uniforms.multiplicator],1,{
				value:0
			})
		}

	})
	let maxThumbDeltaY = HEIGHT - scrollbarThumb.offsetHeight;
	let thumbDeltaY = maxThumbDeltaY - deltaY.map(maxDeltaY, 0, 0, maxThumbDeltaY);
	thumbDeltaY = Math.min(Math.max(0, thumbDeltaY), maxThumbDeltaY);
	TweenMax.to(scrollbarThumb, scrollDuration, {
		y: thumbDeltaY,
		ease: scrollEasing
	});
}

function onMouseDown(e) {
	mouseDown = true;
	e.preventDefault();
}

function onMouseUp(e) {
	mouseDown = false;
	e.preventDefault();
}

function onMouseMove(e) {
	if (mouseDown) {
		let clientY = e.clientY;
		deltaY = maxDeltaY - clientY.map(0, HEIGHT, maxDeltaY, 0);
		scroll();
		e.preventDefault();
	}
}

jsScroll.addEventListener("wheel", onWheel);
scrollbarThumb.addEventListener("mousedown", onMouseDown);
window.addEventListener("mouseup", onMouseUp);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("resize", init);

window.addEventListener("DOMContentLoaded", function() {
	init();
	initCurtain();
})
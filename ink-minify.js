

//Copyright (c) YEAR - YOUR NAME - URL TO ORIGINAL

//Permission is hereby granted, free of charge, to any person 
//obtaining a copy of this software and associated documentation 
//files (the "Software"), to deal in the Software without restriction,
//including without limitation the rights to use, copy, modify, 
//merge, publish, distribute, sublicense, and/or sell copies of 
//the Software, and to permit persons to whom the Software is 
//furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall 
//be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
//EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
//OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
//NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
//HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
//WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
//DEALINGS IN THE SOFTWARE.


    
    let cursorInit = !1;
    const cursor = document.getElementById("ink-cursor"),
        amount = 20,
        sineDots = Math.floor(.3 * amount),
        width = 26,
        idleTimeout = 150;
    let timeoutID, hoverButton, hoverTL, lastFrame = 0,
        mousePosition = {
            x: 0,
            y: 0
        },
        dots = [],
        idle = !1;
    class HoverButton {
        constructor(e) {
            this.hovered = !1, this.animatingHover = !1, this.forceOut = !1, this.timing = .65, this.el = document
                .getElementById(e)
        }
        onMouseEnter() {
            this.hoverInAnim()
        }
        hoverInAnim() {
            this.hovered || (this.hovered = !0, this.animatingHover = !0, this.forceOut = !1, TweenMax.fromTo(this
                .bg, this.timing, {
                    x: "-112%"
                }, {
                    x: "-12%",
                    ease: Power3.easeOut,
                    onComplete: () => {
                        this.animatingHover = !1, this.forceOut && (this.foceOut = !1, this
                            .hoverOutAnim())
                    }
                }))
        }
        onMouseLeave() {
            this.animatingHover ? this.forceOut = !0 : this.hoverOutAnim()
        }
        hoverOutAnim() {
            this.hovered = !1, TweenMax.to(this.bg, this.timing, {
                x: "100%",
                ease: Power3.easeOut,
                onComplete: () => {}
            })
        }
    }
    class Dot {
        constructor(e = 0) {
            this.index = e, this.anglespeed = .05, this.x = 0, this.y = 0, this.scale = 1 - .05 * e, this.range =
                width / 2 - width / 2 * this.scale + 2, this.limit = .75 * width * this.scale, this.element =
                document.createElement("span"), TweenMax.set(this.element, {
                    scale: this.scale
                }), cursor.appendChild(this.element)
        }
        lock() {
            this.lockX = this.x, this.lockY = this.y, this.angleX = 2 * Math.PI * Math.random(), this.angleY = 2 *
                Math.PI * Math.random()
        }
        draw(e) {
            !idle || this.index <= sineDots ? TweenMax.set(this.element, {
                x: this.x,
                y: this.y
            }) : (this.angleX += this.anglespeed, this.angleY += this.anglespeed, this.y = this.lockY + Math
                .sin(this.angleY) * this.range, this.x = this.lockX + Math.sin(this.angleX) * this.range,
                TweenMax.set(this.element, {
                    x: this.x,
                    y: this.y
                }))
        }
    }
    class Circle {
        constructor(e) {
            const t = document.getElementById(e);
            t.parentElement.removeChild(t)
        }
    }

    function init() {
        window.addEventListener("mousemove", onMouseMove), window.addEventListener("touchmove", onTouchMove),
            hoverButton = new HoverButton("button"), lastFrame += new Date, buildDots(), render()
    }

    function startIdleTimer() {
        timeoutID = setTimeout(goInactive, idleTimeout), idle = !1
    }

    function resetIdleTimer() {
        clearTimeout(timeoutID), startIdleTimer()
    }

    function goInactive() {
        idle = !0;
        for (let e of dots) e.lock()
    }

    function buildDots() {
        for (let e = 0; e < amount; e++) {
            let t = new Dot(e);
            dots.push(t)
        }
    }
    const onMouseMove = e => {
            mousePosition.x = e.clientX - width / 2, mousePosition.y = e.clientY - width / 2, resetIdleTimer()
        },
        onTouchMove = () => {
            mousePosition.x = event.touches[0].clientX - width / 2, mousePosition.y = event.touches[0].clientY - width /
                2, resetIdleTimer()
        },
        render = e => {
            positionCursor(e - lastFrame), lastFrame = e, requestAnimationFrame(render)
        },
        positionCursor = e => {
            let t = mousePosition.x,
                i = mousePosition.y;
            dots.forEach((o, s, n) => {
                let h = n[s + 1] || n[0];
                if (o.x = t, o.y = i, o.draw(e), !idle || s <= sineDots) {
                    const e = .35 * (h.x - o.x),
                        s = .35 * (h.y - o.y);
                    t += e, i += s
                }
            })
        },
        inkTablet = window.matchMedia("(max-width: 991px)"),
        inkMobile = window.matchMedia("(max-width: 479px)"),
        inkMediaObserver = () => {
            inkMobile.matches || inkTablet.matches || cursorInit || (cursorInit = !0, init())
        };
    inkMediaObserver(), inkTablet.addListener(inkMediaObserver), inkMobile.addListener(inkMediaObserver);

    
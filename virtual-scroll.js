! function() {
    "use strict";

    function s(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }

    function n(t, e) {
        for (var i = 0; i < e.length; i++) {
            var s = e[i];
            s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(t, s.key, s)
        }
    }

    function o(t, e, i) {
        return e && n(t.prototype, e), i && n(t, i), t
    }

    function i(e, t) {
        var i = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var s = Object.getOwnPropertySymbols(e);
            t && (s = s.filter(function(t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable
            })), i.push.apply(i, s)
        }
        return i
    }

    function e(t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                writable: !0,
                configurable: !0
            }
        }), e && a(t, e)
    }

    function l(t) {
        return (l = Object.setPrototypeOf ? Object.getPrototypeOf : function(t) {
            return t.__proto__ || Object.getPrototypeOf(t)
        })(t)
    }

    function a(t, e) {
        return (a = Object.setPrototypeOf || function(t, e) {
            return t.__proto__ = e, t
        })(t, e)
    }

    function r(t, e) {
        return !e || "object" != typeof e && "function" != typeof e ? function(t) {
            if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return t
        }(t) : e
    }

    function c(t, e, i) {
        return (c = "undefined" != typeof Reflect && Reflect.get ? Reflect.get : function(t, e, i) {
            var s = function(t, e) {
                for (; !Object.prototype.hasOwnProperty.call(t, e) && null !== (t = l(t)););
                return t
            }(t, e);
            if (s) {
                var n = Object.getOwnPropertyDescriptor(s, e);
                return n.get ? n.get.call(i) : n.value
            }
        })(t, e, i || t)
    }
    var h = {
            el: document,
            elMobile: document,
            name: "scroll",
            offset: 0,
            repeat: !1,
            smooth: !1,
            smoothMobile: !1,
            direction: "vertical",
            inertia: 1,
            class: "is-inview",
            scrollbarClass: "c-scrollbar",
            scrollingClass: "has-scroll-scrolling",
            draggingClass: "has-scroll-dragging",
            smoothClass: "has-scroll-smooth",
            initClass: "has-scroll-init",
            getSpeed: !1,
            getDirection: !1
        },
        u = function() {
            function e() {
                var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};
                s(this, e), window.scrollTo(0, 0), Object.assign(this, h, t), this.namespace = "locomotive", this.html = document.documentElement, this.windowHeight = window.innerHeight, this.windowMiddle = this.windowHeight / 2, this.els = [], this.hasScrollTicking = !1, this.checkScroll = this.checkScroll.bind(this), this.checkResize = this.checkResize.bind(this), this.instance = {
                    scroll: {
                        x: 0,
                        y: 0
                    },
                    limit: this.html.offsetHeight
                }, this.getDirection && (this.instance.direction = null), this.getDirection && (this.instance.speed = 0), this.html.classList.add(this.initClass), window.addEventListener("resize", this.checkResize, !1)
            }
            return o(e, [{
                key: "init",
                value: function() {
                    this.initEvents()
                }
            }, {
                key: "checkScroll",
                value: function() {
                    this.dispatchScroll()
                }
            }, {
                key: "checkResize",
                value: function() {}
            }, {
                key: "initEvents",
                value: function() {
                    var e = this;
                    this.scrollToEls = this.el.querySelectorAll("[data-".concat(this.name, "-to]")), this.setScrollTo = this.setScrollTo.bind(this), this.scrollToEls.forEach(function(t) {
                        t.addEventListener("click", e.setScrollTo, !1)
                    })
                }
            }, {
                key: "setScrollTo",
                value: function(t) {
                    t.preventDefault(), this.scrollTo(t.currentTarget.getAttribute("data-".concat(this.name, "-href")) || t.currentTarget.getAttribute("href"), t.currentTarget.getAttribute("data-".concat(this.name, "-offset")))
                }
            }, {
                key: "addElements",
                value: function() {}
            }, {
                key: "detectElements",
                value: function() {
                    var i = this,
                        s = this.instance.scroll.y,
                        n = s + this.windowHeight;
                    this.els.forEach(function(t, e) {
                        t.inView || n >= t.top && s < t.bottom && i.setInView(t, e), t.inView && (n < t.top || s > t.bottom) && i.setOutOfView(t, e)
                    }), this.hasScrollTicking = !1
                }
            }, {
                key: "setInView",
                value: function(t, e) {
                    this.els[e].inView = !0, t.el.classList.add(t.class), t.call && this.dispatchCall(t, "enter"), t.repeat || !1 !== t.speed || t.sticky || this.els.splice(e, 1)
                }
            }, {
                key: "setOutOfView",
                value: function(t, e) {
                    (t.repeat || void 0 !== t.speed) && (this.els[e].inView = !1), t.call && this.dispatchCall(t, "exit"), t.repeat && t.el.classList.remove(t.class)
                }
            }, {
                key: "dispatchCall",
                value: function(t, e) {
                    this.callWay = e, this.callValue = t.call.split(",").map(function(t) {
                        return t.trim()
                    }), this.callObj = t, 1 == this.callValue.length && (this.callValue = this.callValue[0]);
                    var i = new Event(this.namespace + "call");
                    window.dispatchEvent(i)
                }
            }, {
                key: "dispatchScroll",
                value: function() {
                    var t = new Event(this.namespace + "scroll");
                    window.dispatchEvent(t)
                }
            }, {
                key: "setEvents",
                value: function(t, e) {
                    var i = this;
                    window.addEventListener(this.namespace + t, function() {
                        switch (t) {
                            case "scroll":
                                return e(i.instance);
                            case "call":
                                return e(i.callValue, i.callWay, i.callObj);
                            default:
                                return e()
                        }
                    }, !1)
                }
            }, {
                key: "startScroll",
                value: function() {}
            }, {
                key: "stopScroll",
                value: function() {}
            }, {
                key: "setScroll",
                value: function(t, e) {
                    this.instance.scroll = {
                        x: 0,
                        y: 0
                    }
                }
            }, {
                key: "destroy",
                value: function() {
                    var e = this;
                    window.removeEventListener("resize", this.checkResize, !1), this.scrollToEls.forEach(function(t) {
                        t.removeEventListener("click", e.setScrollTo, !1)
                    })
                }
            }]), e
        }(),
        t = function(t) {
            function i() {
                var t, e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};
                return s(this, i), t = r(this, l(i).call(this, e)), window.addEventListener("scroll", t.checkScroll, !1), t
            }
            return e(i, u), o(i, [{
                key: "init",
                value: function() {
                    this.instance.scroll.y = window.scrollY, this.addElements(), this.detectElements(), c(l(i.prototype), "init", this).call(this)
                }
            }, {
                key: "checkScroll",
                value: function() {
                    var t = this;
                    c(l(i.prototype), "checkScroll", this).call(this), this.els.length && (this.instance.scroll.y = window.scrollY, this.hasScrollTicking || (requestAnimationFrame(function() {
                        t.detectElements()
                    }), this.hasScrollTicking = !0))
                }
            }, {
                key: "checkResize",
                value: function() {
                    var t = this;
                    this.els.length && (this.windowHeight = window.innerHeight, this.hasScrollTicking || (requestAnimationFrame(function() {
                        t.updateElements()
                    }), this.hasScrollTicking = !0))
                }
            }, {
                key: "addElements",
                value: function() {
                    var r = this;
                    this.el.querySelectorAll("[data-" + this.name + "]").forEach(function(t, e) {
                        var i = t.dataset[r.name + "Class"] || r.class,
                            s = t.getBoundingClientRect().top + r.instance.scroll.y,
                            n = s + t.offsetHeight,
                            o = parseInt(t.dataset[r.name + "Offset"]) || parseInt(r.offset),
                            l = t.dataset[r.name + "Repeat"],
                            a = t.dataset[r.name + "Call"];
                        l = "false" != l && (null != l || r.repeat), r.els[e] = {
                            el: t,
                            class: i,
                            top: s + o,
                            bottom: n,
                            offset: o,
                            repeat: l,
                            inView: !1,
                            call: a
                        }
                    })
                }
            }, {
                key: "updateElements",
                value: function() {
                    var n = this;
                    this.els.forEach(function(t, e) {
                        var i = t.el.getBoundingClientRect().top + n.instance.scroll.y,
                            s = i + t.el.offsetHeight;
                        n.els[e].top = i + t.offset, n.els[e].bottom = s
                    }), this.hasScrollTicking = !1
                }
            }, {
                key: "scrollTo",
                value: function(t, e) {
                    var i, s = e ? parseInt(e) : 0;
                    if ("string" == typeof t)
                        if ("top" === t) i = this.html;
                        else {
                            if ("bottom" === t) return s = document.offsetHeight, void this.html.scrollIntoView({
                                behavior: "smooth",
                                block: "end",
                                inline: "nearest"
                            });
                            i = document.querySelectorAll(t)[0]
                        } else t.target || (i = t);
                    i && (s = i.getBoundingClientRect().top + s), i.scrollIntoView({
                        behavior: "smooth"
                    })
                }
            }, {
                key: "update",
                value: function() {
                    this.updateElements()
                }
            }, {
                key: "destroy",
                value: function() {
                    c(l(i.prototype), "destroy", this).call(this), window.removeEventListener("scroll", this.checkScroll, !1)
                }
            }]), i
        }(),
        d = Object.getOwnPropertySymbols,
        f = Object.prototype.hasOwnProperty,
        p = Object.prototype.propertyIsEnumerable;
    var y = function() {
        try {
            if (!Object.assign) return !1;
            var t = new String("abc");
            if (t[5] = "de", "5" === Object.getOwnPropertyNames(t)[0]) return !1;
            for (var e = {}, i = 0; i < 10; i++) e["_" + String.fromCharCode(i)] = i;
            if ("0123456789" !== Object.getOwnPropertyNames(e).map(function(t) {
                    return e[t]
                }).join("")) return !1;
            var s = {};
            return "abcdefghijklmnopqrst".split("").forEach(function(t) {
                s[t] = t
            }), "abcdefghijklmnopqrst" === Object.keys(Object.assign({}, s)).join("")
        } catch (t) {
            return !1
        }
    }() ? Object.assign : function(t, e) {
        for (var i, s, n = function(t) {
                if (null == t) throw new TypeError("Object.assign cannot be called with null or undefined");
                return Object(t)
            }(t), o = 1; o < arguments.length; o++) {
            for (var l in i = Object(arguments[o])) f.call(i, l) && (n[l] = i[l]);
            if (d) {
                s = d(i);
                for (var a = 0; a < s.length; a++) p.call(i, s[a]) && (n[s[a]] = i[s[a]])
            }
        }
        return n
    };

    function m() {}
    m.prototype = {
        on: function(t, e, i) {
            var s = this.e || (this.e = {});
            return (s[t] || (s[t] = [])).push({
                fn: e,
                ctx: i
            }), this
        },
        once: function(t, e, i) {
            var s = this;

            function n() {
                s.off(t, n), e.apply(i, arguments)
            }
            return n._ = e, this.on(t, n, i)
        },
        emit: function(t) {
            for (var e = [].slice.call(arguments, 1), i = ((this.e || (this.e = {}))[t] || []).slice(), s = 0, n = i.length; s < n; s++) i[s].fn.apply(i[s].ctx, e);
            return this
        },
        off: function(t, e) {
            var i = this.e || (this.e = {}),
                s = i[t],
                n = [];
            if (s && e)
                for (var o = 0, l = s.length; o < l; o++) s[o].fn !== e && s[o].fn._ !== e && n.push(s[o]);
            return n.length ? i[t] = n : delete i[t], this
        }
    };
    var v = m,
        g = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};
    var w, b = (function(t, e) {
            (function() {
                (null !== e ? e : this).Lethargy = function() {
                    function t(t, e, i, s) {
                        this.stability = null != t ? Math.abs(t) : 8, this.sensitivity = null != e ? 1 + Math.abs(e) : 100, this.tolerance = null != i ? 1 + Math.abs(i) : 1.1, this.delay = null != s ? s : 150, this.lastUpDeltas = function() {
                            var t, e, i;
                            for (i = [], t = 1, e = 2 * this.stability; 1 <= e ? t <= e : e <= t; 1 <= e ? t++ : t--) i.push(null);
                            return i
                        }.call(this), this.lastDownDeltas = function() {
                            var t, e, i;
                            for (i = [], t = 1, e = 2 * this.stability; 1 <= e ? t <= e : e <= t; 1 <= e ? t++ : t--) i.push(null);
                            return i
                        }.call(this), this.deltasTimestamp = function() {
                            var t, e, i;
                            for (i = [], t = 1, e = 2 * this.stability; 1 <= e ? t <= e : e <= t; 1 <= e ? t++ : t--) i.push(null);
                            return i
                        }.call(this)
                    }
                    return t.prototype.check = function(t) {
                        var e;
                        return null != (t = t.originalEvent || t).wheelDelta ? e = t.wheelDelta : null != t.deltaY ? e = -40 * t.deltaY : null == t.detail && 0 !== t.detail || (e = -40 * t.detail), this.deltasTimestamp.push(Date.now()), this.deltasTimestamp.shift(), 0 < e ? (this.lastUpDeltas.push(e), this.lastUpDeltas.shift(), this.isInertia(1)) : (this.lastDownDeltas.push(e), this.lastDownDeltas.shift(), this.isInertia(-1))
                    }, t.prototype.isInertia = function(t) {
                        var e, i, s, n, o, l, a;
                        return null === (e = -1 === t ? this.lastDownDeltas : this.lastUpDeltas)[0] ? t : !(this.deltasTimestamp[2 * this.stability - 2] + this.delay > Date.now() && e[0] === e[2 * this.stability - 1]) && (s = e.slice(0, this.stability), i = e.slice(this.stability, 2 * this.stability), a = s.reduce(function(t, e) {
                            return t + e
                        }), o = i.reduce(function(t, e) {
                            return t + e
                        }), l = a / s.length, n = o / i.length, Math.abs(l) < Math.abs(n * this.tolerance) && this.sensitivity < Math.abs(n) && t)
                    }, t.prototype.showLastUpDeltas = function() {
                        return this.lastUpDeltas
                    }, t.prototype.showLastDownDeltas = function() {
                        return this.lastDownDeltas
                    }, t
                }()
            }).call(g)
        }(w = {
            exports: {}
        }, w.exports), w.exports),
        S = {
            hasWheelEvent: "onwheel" in document,
            hasMouseWheelEvent: "onmousewheel" in document,
            hasTouch: "ontouchstart" in document,
            hasTouchWin: navigator.msMaxTouchPoints && 1 < navigator.msMaxTouchPoints,
            hasPointer: !!window.navigator.msPointerEnabled,
            hasKeyDown: "onkeydown" in document,
            isFirefox: -1 < navigator.userAgent.indexOf("Firefox")
        },
        k = Object.prototype.toString,
        T = Object.prototype.hasOwnProperty;

    function E(t, e) {
        return function() {
            return t.apply(e, arguments)
        }
    }
    var O = b.Lethargy,
        D = "virtualscroll",
        _ = H,
        L = 37,
        M = 38,
        C = 39,
        j = 40,
        x = 32;

    function H(t) {
        ! function(t) {
            if (!t) return console.warn("bindAll requires at least one argument.");
            var e = Array.prototype.slice.call(arguments, 1);
            if (0 === e.length)
                for (var i in t) T.call(t, i) && "function" == typeof t[i] && "[object Function]" == k.call(t[i]) && e.push(i);
            for (var s = 0; s < e.length; s++) {
                var n = e[s];
                t[n] = E(t[n], t)
            }
        }(this, "_onWheel", "_onMouseWheel", "_onTouchStart", "_onTouchMove", "_onKeyDown"), this.el = window, t && t.el && (this.el = t.el, delete t.el), this.options = y({
            mouseMultiplier: 1,
            touchMultiplier: 2,
            firefoxMultiplier: 15,
            keyStep: 120,
            preventTouch: !1,
            unpreventTouchClass: "vs-touchmove-allowed",
            limitInertia: !1,
            useKeyboard: !0,
            useTouch: !0
        }, t), this.options.limitInertia && (this._lethargy = new O), this._emitter = new v, this._event = {
            y: 0,
            x: 0,
            deltaX: 0,
            deltaY: 0
        }, this.touchStartX = null, this.touchStartY = null, this.bodyTouchAction = null, void 0 !== this.options.passive && (this.listenerOptions = {
            passive: this.options.passive
        })
    }

    function B(t, e, i) {
        return (1 - i) * t + i * e
    }

    function P(t) {
        var e = {};
        if (window.getComputedStyle) {
            var i = getComputedStyle(t),
                s = i.transform || i.webkitTransform || i.mozTransform,
                n = s.match(/^matrix3d\((.+)\)$/);
            return n ? parseFloat(n[1].split(", ")[13]) : (n = s.match(/^matrix\((.+)\)$/), e.x = n ? parseFloat(n[1].split(", ")[4]) : 0, e.y = n ? parseFloat(n[1].split(", ")[5]) : 0, e)
        }
    }
    H.prototype._notify = function(t) {
        var e = this._event;
        e.x += e.deltaX, e.y += e.deltaY, this._emitter.emit(D, {
            x: e.x,
            y: e.y,
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            originalEvent: t
        })
    }, H.prototype._onWheel = function(t) {
        var e = this.options;
        if (!this._lethargy || !1 !== this._lethargy.check(t)) {
            var i = this._event;
            i.deltaX = t.wheelDeltaX || -1 * t.deltaX, i.deltaY = t.wheelDeltaY || -1 * t.deltaY, S.isFirefox && 1 == t.deltaMode && (i.deltaX *= e.firefoxMultiplier, i.deltaY *= e.firefoxMultiplier), i.deltaX *= e.mouseMultiplier, i.deltaY *= e.mouseMultiplier, this._notify(t)
        }
    }, H.prototype._onMouseWheel = function(t) {
        if (!this.options.limitInertia || !1 !== this._lethargy.check(t)) {
            var e = this._event;
            e.deltaX = t.wheelDeltaX ? t.wheelDeltaX : 0, e.deltaY = t.wheelDeltaY ? t.wheelDeltaY : t.wheelDelta, this._notify(t)
        }
    }, H.prototype._onTouchStart = function(t) {
        var e = t.targetTouches ? t.targetTouches[0] : t;
        this.touchStartX = e.pageX, this.touchStartY = e.pageY
    }, H.prototype._onTouchMove = function(t) {
        var e = this.options;
        e.preventTouch && !t.target.classList.contains(e.unpreventTouchClass) && t.preventDefault();
        var i = this._event,
            s = t.targetTouches ? t.targetTouches[0] : t;
        i.deltaX = (s.pageX - this.touchStartX) * e.touchMultiplier, i.deltaY = (s.pageY - this.touchStartY) * e.touchMultiplier, this.touchStartX = s.pageX, this.touchStartY = s.pageY, this._notify(t)
    }, H.prototype._onKeyDown = function(t) {
        var e = this._event;
        e.deltaX = e.deltaY = 0;
        var i = window.innerHeight - 40;
        switch (t.keyCode) {
            case L:
            case M:
                e.deltaY = this.options.keyStep;
                break;
            case C:
            case j:
                e.deltaY = -this.options.keyStep;
                break;
            case t.shiftKey:
                e.deltaY = i;
                break;
            case x:
                e.deltaY = -i;
                break;
            default:
                return
        }
        this._notify(t)
    }, H.prototype._bind = function() {
        S.hasWheelEvent && this.el.addEventListener("wheel", this._onWheel, this.listenerOptions), S.hasMouseWheelEvent && this.el.addEventListener("mousewheel", this._onMouseWheel, this.listenerOptions), S.hasTouch && this.options.useTouch && (this.el.addEventListener("touchstart", this._onTouchStart, this.listenerOptions), this.el.addEventListener("touchmove", this._onTouchMove, this.listenerOptions)), S.hasPointer && S.hasTouchWin && (this.bodyTouchAction = document.body.style.msTouchAction, document.body.style.msTouchAction = "none", this.el.addEventListener("MSPointerDown", this._onTouchStart, !0), this.el.addEventListener("MSPointerMove", this._onTouchMove, !0)), S.hasKeyDown && this.options.useKeyboard && document.addEventListener("keydown", this._onKeyDown)
    }, H.prototype._unbind = function() {
        S.hasWheelEvent && this.el.removeEventListener("wheel", this._onWheel), S.hasMouseWheelEvent && this.el.removeEventListener("mousewheel", this._onMouseWheel), S.hasTouch && (this.el.removeEventListener("touchstart", this._onTouchStart), this.el.removeEventListener("touchmove", this._onTouchMove)), S.hasPointer && S.hasTouchWin && (document.body.style.msTouchAction = this.bodyTouchAction, this.el.removeEventListener("MSPointerDown", this._onTouchStart, !0), this.el.removeEventListener("MSPointerMove", this._onTouchMove, !0)), S.hasKeyDown && this.options.useKeyboard && document.removeEventListener("keydown", this._onKeyDown)
    }, H.prototype.on = function(t, e) {
        this._emitter.on(D, t, e);
        var i = this._emitter.e;
        i && i[D] && 1 === i[D].length && this._bind()
    }, H.prototype.off = function(t, e) {
        this._emitter.off(D, t, e);
        var i = this._emitter.e;
        (!i[D] || i[D].length <= 0) && this._unbind()
    }, H.prototype.reset = function() {
        var t = this._event;
        t.x = 0, t.y = 0
    }, H.prototype.destroy = function() {
        this._emitter.off(), this._unbind()
    };
    var Y = function(t) {
            function n() {
                var t, e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};
                return s(this, n), (t = r(this, l(n).call(this, e))).inertia = .1 * t.inertia, t.isScrolling = !1, t.isDraggingScrollbar = !1, t.isTicking = !1, t.hasScrollTicking = !1, t.parallaxElements = [], t.inertiaRatio = 1, t.stop = !1, t
            }
            return e(n, u), o(n, [{
                key: "init",
                value: function() {
                    var e = this;
                    this.html.classList.add(this.smoothClass), this.instance = function(n) {
                        for (var t = 1; t < arguments.length; t++) {
                            var o = null != arguments[t] ? arguments[t] : {};
                            t % 2 ? i(o, !0).forEach(function(t) {
                                var e, i, s;
                                e = n, s = o[i = t], i in e ? Object.defineProperty(e, i, {
                                    value: s,
                                    enumerable: !0,
                                    configurable: !0,
                                    writable: !0
                                }) : e[i] = s
                            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(o)) : i(o).forEach(function(t) {
                                Object.defineProperty(n, t, Object.getOwnPropertyDescriptor(o, t))
                            })
                        }
                        return n
                    }({
                        delta: {
                            x: 0,
                            y: 0
                        }
                    }, this.instance), this.vs = new _({
                        mouseMultiplier: -1 < navigator.platform.indexOf("Win") ? 1 : .4,
                        touchMultiplier: 4,
                        firefoxMultiplier: 30
                    }), this.vs.on(function(t) {
                        e.stop || (e.isTicking || e.isDraggingScrollbar || (requestAnimationFrame(function() {
                            e.isScrolling || e.startScrolling(), e.updateDelta(t)
                        }), e.isTicking = !0), e.isTicking = !1)
                    }), this.setScrollLimit(), this.initScrollBar(), this.addSections(), this.addElements(), this.detectElements(), this.transformElements(!0), c(l(n.prototype), "init", this).call(this)
                }
            }, {
                key: "setScrollLimit",
                value: function() {
                    this.instance.limit = this.el.offsetHeight - this.windowHeight
                }
            }, {
                key: "startScrolling",
                value: function() {
                    this.isScrolling = !0, this.checkScroll(), this.html.classList.add(this.scrollingClass)
                }
            }, {
                key: "stopScrolling",
                value: function() {
                    this.isScrolling = !1, this.inertiaRatio = 1, this.instance.scroll.y = Math.round(this.instance.scroll.y), this.html.classList.remove(this.scrollingClass)
                }
            }, {
                key: "checkScroll",
                value: function() {
                    var t = this;
                    if (this.isScrolling || this.isDraggingScrollbar) {
                        this.hasScrollTicking || (requestAnimationFrame(function() {
                            return t.checkScroll()
                        }), this.hasScrollTicking = !0);
                        var e = Math.abs(this.instance.delta.y - this.instance.scroll.y);
                        (e < .5 && 0 != this.instance.delta.y || e < .5 && 0 == this.instance.delta.y) && this.stopScrolling(), this.updateScroll();
                        for (var i = this.sections.length - 1; 0 <= i; i--) this.sections[i].persistent || this.instance.scroll.y > this.sections[i].offset && this.instance.scroll.y < this.sections[i].limit ? (this.transform(this.sections[i].el, 0, -this.instance.scroll.y), this.sections[i].el.style.visibility = "visible", this.sections[i].inView = !0) : (this.sections[i].el.style.visibility = "hidden", this.sections[i].inView = !1, this.transform(this.sections[i].el, 0, 0));
                        this.getDirection && this.addDirection(), this.getSpeed && (this.addSpeed(), this.timestamp = Date.now()), this.detectElements(), this.transformElements();
                        var s = this.instance.scroll.y / this.instance.limit * this.scrollBarLimit;
                        this.transform(this.scrollbarThumb, 0, s), c(l(n.prototype), "checkScroll", this).call(this), this.hasScrollTicking = !1
                    }
                }
            }, {
                key: "checkResize",
                value: function() {
                    this.windowHeight = window.innerHeight, this.windowMiddle = this.windowHeight / 2, this.update()
                }
            }, {
                key: "updateDelta",
                value: function(t) {
                    this.instance.delta.y -= t.deltaY, this.instance.delta.y < 0 && (this.instance.delta.y = 0), this.instance.delta.y > this.instance.limit && (this.instance.delta.y = this.instance.limit)
                }
            }, {
                key: "updateScroll",
                value: function(t) {
                    this.isScrolling || this.isDraggingScrollbar ? this.instance.scroll.y = B(this.instance.scroll.y, this.instance.delta.y, this.inertia * this.inertiaRatio) : this.instance.scroll.y = this.instance.delta.y
                }
            }, {
                key: "addDirection",
                value: function() {
                    this.instance.delta.y > this.instance.scroll.y ? "down" !== this.instance.direction && (this.instance.direction = "down") : this.instance.delta.y < this.instance.scroll.y && "up" !== this.instance.direction && (this.instance.direction = "up")
                }
            }, {
                key: "addSpeed",
                value: function() {
                    this.instance.delta.y != this.instance.scroll.y ? this.instance.speed = (this.instance.delta.y - this.instance.scroll.y) / (Date.now() - this.timestamp) : this.instance.speed = 0
                }
            }, {
                key: "initScrollBar",
                value: function() {
                    this.scrollbar = document.createElement("span"), this.scrollbarThumb = document.createElement("span"), this.scrollbar.classList.add("".concat(this.scrollbarClass)), this.scrollbarThumb.classList.add("".concat(this.scrollbarClass, "_thumb")), this.scrollbar.append(this.scrollbarThumb), document.body.append(this.scrollbar), this.scrollbarThumb.style.height = "".concat(window.innerHeight * window.innerHeight / (this.instance.limit + window.innerHeight), "px"), this.scrollBarLimit = window.innerHeight - this.scrollbarThumb.getBoundingClientRect().height, this.getScrollBar = this.getScrollBar.bind(this), this.releaseScrollBar = this.releaseScrollBar.bind(this), this.moveScrollBar = this.moveScrollBar.bind(this), this.scrollbarThumb.addEventListener("mousedown", this.getScrollBar), window.addEventListener("mouseup", this.releaseScrollBar), window.addEventListener("mousemove", this.moveScrollBar)
                }
            }, {
                key: "reinitScrollBar",
                value: function() {
                    this.scrollbarThumb.style.height = "".concat(window.innerHeight * window.innerHeight / this.instance.limit, "px"), this.scrollBarLimit = window.innerHeight - this.scrollbarThumb.getBoundingClientRect().height
                }
            }, {
                key: "destroyScrollBar",
                value: function() {
                    this.scrollbarThumb.removeEventListener("mousedown", this.getScrollBar), window.removeEventListener("mouseup", this.releaseScrollBar), window.removeEventListener("mousemove", this.moveScrollBar), this.scrollbar.remove()
                }
            }, {
                key: "getScrollBar",
                value: function(t) {
                    this.isDraggingScrollbar = !0, this.checkScroll(), this.html.classList.remove(this.scrollingClass), this.html.classList.add(this.draggingClass)
                }
            }, {
                key: "releaseScrollBar",
                value: function(t) {
                    this.isDraggingScrollbar = !1, this.html.classList.add(this.scrollingClass), this.html.classList.remove(this.draggingClass)
                }
            }, {
                key: "moveScrollBar",
                value: function(e) {
                    var i = this;
                    !this.isTicking && this.isDraggingScrollbar && (requestAnimationFrame(function() {
                        var t = 100 * e.clientY / window.innerHeight * i.instance.limit / 100;
                        0 < t && t < i.instance.limit && (i.instance.delta.y = t)
                    }), this.isTicking = !0), this.isTicking = !1
                }
            }, {
                key: "addElements",
                value: function() {
                    var w = this;
                    this.els = [], this.parallaxElements = [];
                    var b = 0;
                    this.sections.forEach(function(t, g) {
                        w.sections[g].el.querySelectorAll("[data-".concat(w.name, "]")).forEach(function(t, e) {
                            var i, s, n = t.dataset[w.name + "Class"] || w.class,
                                o = t.dataset[w.name + "Repeat"],
                                l = t.dataset[w.name + "Call"],
                                a = t.dataset[w.name + "Position"],
                                r = t.dataset[w.name + "Delay"],
                                c = t.dataset[w.name + "Direction"],
                                h = "string" == typeof t.dataset[w.name + "Sticky"],
                                u = !!t.dataset[w.name + "Speed"] && parseFloat(t.dataset[w.name + "Speed"]) / 10,
                                d = "string" == typeof t.dataset[w.name + "Offset"] && t.dataset[w.name + "Offset"].split(","),
                                f = t.dataset[w.name + "Target"];
                            s = void 0 !== f ? document.querySelector("".concat(f)) : t;
                            var p = (i = w.sections[g].inView ? s.getBoundingClientRect().top + w.instance.scroll.y - P(s).y : s.getBoundingClientRect().top - P(w.sections[g].el).y - P(s).y) + s.offsetHeight,
                                y = (p - i) / 2 + i;
                            h && (y = ((p = (i += window.innerHeight) + s.offsetHeight - window.innerHeight - t.offsetHeight) - i) / 2 + i), o = "false" != o && (null != o || w.repeat);
                            var m = [0, 0];
                            if (d)
                                for (e = 0; e < d.length; e++) d[e].includes("%") ? m[e] = parseInt(d[e].replace("%", "") * w.windowHeight / 100) : m[e] = parseInt(d[e]);
                            var v = {
                                el: t,
                                id: b,
                                class: n,
                                top: i + m[0],
                                middle: y,
                                bottom: p - m[1],
                                offset: d,
                                repeat: o,
                                inView: !1,
                                call: l,
                                speed: u,
                                delay: r,
                                position: a,
                                target: s,
                                direction: c,
                                sticky: h
                            };
                            b++, w.els.push(v), (!1 !== u || h) && w.parallaxElements.push(v)
                        })
                    })
                }
            }, {
                key: "addSections",
                value: function() {
                    var a = this;
                    this.sections = [];
                    var t = this.el.querySelectorAll("[data-".concat(this.name, "-section]"));
                    0 === t.length && (t = [this.el]), t.forEach(function(t, e) {
                        var i = t.getBoundingClientRect().top - 1.5 * window.innerHeight - P(t).y,
                            s = i + t.getBoundingClientRect().height + 2 * window.innerHeight,
                            n = "string" == typeof t.dataset[a.name + "Persistent"],
                            o = !1;
                        a.instance.scroll.y >= i && a.instance.scroll.y <= s && (o = !0);
                        var l = {
                            el: t,
                            offset: i,
                            limit: s,
                            inView: o,
                            persistent: n
                        };
                        a.sections[e] = l
                    })
                }
            }, {
                key: "transform",
                value: function(t, e, i, s) {
                    var n;
                    if (s) {
                        var o = P(t),
                            l = B(o.x, e, s),
                            a = B(o.y, i, s);
                        n = "matrix(1,0,0,1,".concat(l, ",").concat(a, ")")
                    } else n = "matrix(1,0,0,1,".concat(e, ",").concat(i, ")");
                    t.style.webkitTransform = n, t.style.msTransform = n, t.style.transform = n
                }
            }, {
                key: "transformElements",
                value: function(s) {
                    var n = this,
                        o = this.instance.scroll.y + this.windowHeight,
                        l = this.instance.scroll.y + this.windowMiddle;
                    this.parallaxElements.forEach(function(t, e) {
                        var i = !1;
                        if (s && (i = 0), t.inView) switch (t.position) {
                            case "top":
                                i = n.instance.scroll.y * -t.speed;
                                break;
                            case "bottom":
                                i = (n.instance.limit - o + n.windowHeight) * t.speed;
                                break;
                            default:
                                i = (l - t.middle) * -t.speed
                        }
                        t.sticky && (i = t.inView ? n.instance.scroll.y - t.top + window.innerHeight : n.instance.scroll.y < t.top - window.innerHeight && n.instance.scroll.y < t.top - window.innerHeight / 2 ? 0 : n.instance.scroll.y > t.bottom && n.instance.scroll.y > t.bottom + 100 && t.bottom - t.top + window.innerHeight), !1 !== i && ("horizontal" === t.direction ? n.transform(t.el, i, 0, !s && t.delay) : n.transform(t.el, 0, i, !s && t.delay))
                    })
                }
            }, {
                key: "scrollTo",
                value: function(t, e) {
                    var i, s = this,
                        n = e ? parseInt(e) : 0;
                    if ("string" == typeof t ? "top" === t ? n = 0 : "bottom" === t ? n = this.instance.limit : i = document.querySelectorAll(t)[0] : t.target || (i = t), i) {
                        var o = i.getBoundingClientRect().top + this.instance.scroll.y,
                            l = function(t) {
                                for (var e = []; t && t !== document; t = t.parentNode) e.push(t);
                                return e
                            }(i).find(function(e) {
                                return s.sections.find(function(t) {
                                    return t.element == e
                                })
                            }),
                            a = 0;
                        l && (a = P(l).y), n = o + n - a
                    }
                    n -= this.instance.scroll.y, this.instance.delta.y = Math.min(n, this.instance.limit), this.inertiaRatio = Math.min(4e3 / Math.abs(this.instance.delta.y - this.instance.scroll.y), .8), this.isScrolling = !0, this.checkScroll(), this.html.classList.add(this.scrollingClass)
                }
            }, {
                key: "update",
                value: function() {
                    this.setScrollLimit(), this.addSections(), this.addElements(), this.detectElements(), this.updateScroll(), this.transformElements(!0)
                }
            }, {
                key: "startScroll",
                value: function() {
                    this.stop = !1
                }
            }, {
                key: "stopScroll",
                value: function() {
                    this.stop = !0
                }
            }, {
                key: "setScroll",
                value: function(t, e) {
                    this.instance = {
                        scroll: {
                            x: t,
                            y: e
                        },
                        delta: {
                            x: t,
                            y: e
                        }
                    }
                }
            }, {
                key: "destroy",
                value: function() {
                    c(l(n.prototype), "destroy", this).call(this), this.stopScrolling(), this.html.classList.remove(this.smoothClass), this.vs.destroy(), this.destroyScrollBar()
                }
            }]), n
        }(),
        R = function() {
            function e() {
                var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};
                s(this, e), this.options = t, Object.assign(this, h, t), this.init()
            }
            return o(e, [{
                key: "init",
                value: function() {
                    this.smoothMobile || (this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)), !0 !== this.smooth || this.isMobile ? this.scroll = new t(this.options) : this.scroll = new Y(this.options), this.scroll.init(), window.location.hash && this.scroll.scrollTo(window.location.hash)
                }
            }, {
                key: "update",
                value: function() {
                    this.scroll.update()
                }
            }, {
                key: "start",
                value: function() {
                    this.scroll.startScroll()
                }
            }, {
                key: "stop",
                value: function() {
                    this.scroll.stopScroll()
                }
            }, {
                key: "scrollTo",
                value: function(t, e) {
                    this.scroll.scrollTo(t, e)
                }
            }, {
                key: "setScroll",
                value: function(t, e) {
                    this.scroll.setScroll(t, e)
                }
            }, {
                key: "on",
                value: function(t, e) {
                    this.scroll.setEvents(t, e)
                }
            }, {
                key: "destroy",
                value: function() {
                    this.scroll.destroy()
                }
            }]), e
        }();
    document.documentElement.classList.add("is-loaded"), document.documentElement.classList.remove("is-loading"), setTimeout(function() {
        document.documentElement.classList.add("is-ready")
    }, 300), setTimeout(function() {
        var i = new R({
                el: document.querySelector("#js-scroll"),
                smooth: !0,
                getSpeed: !0,
                getDirection: !0
            }),
            n = [],
            o = [];
        i.on("scroll", function(t) {
            var e = 360 * t.scroll.y / t.limit;
            i.el.style.backgroundColor = "hsl(".concat(e, ", 11%, 81%)"), n.forEach(function(t) {
                t.el.style.backgroundColor = "hsl(".concat(e, ", 11%, 81%)")
            }), o.forEach(function(t) {
                t.el.style.color = "hsl(".concat(e, ", 11%, 81%)")
            }), document.documentElement.setAttribute("data-direction", t.direction)
        })
    }, 1e3)
}();

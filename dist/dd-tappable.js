!function(e){function t(a){if(n[a])return n[a].exports;var r=n[a]={i:a,l:!1,exports:{}};return e[a].call(r.exports,r,r.exports,t),r.l=!0,r.exports}var n={};t.m=e,t.c=n,t.d=function(e,n,a){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:a})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,n){"use strict";var a=n(1),r=function(e){return e&&e.__esModule?e:{default:e}}(a);window.DDTappable=r.default},function(e,t,n){"use strict";function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function r(e,t){o(e,t),e.className=e.className+" "+t}function o(e,t){e.className=e.className.split(t).join(" ").replace(/\s+/," ")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(t,n,a){return n&&e(t.prototype,n),a&&e(t,a),t}}(),u=n(2),l=function(e){return e&&e.__esModule?e:{default:e}}(u);!function(){function e(e,t){t=t||{bubbles:!1,cancelable:!1,detail:void 0};var n=document.createEvent("CustomEvent");return n.initCustomEvent(e,t.bubbles,t.cancelable,t.detail),n}if("function"==typeof window.CustomEvent)return!1;e.prototype=window.Event.prototype,window.CustomEvent=e}();var c=5e3,s=44,d="dd-touch",v="dd-tap",f="dd-drag",p={start:{touch:"touchstart",mouse:"mousedown"},move:{touch:"touchmove",mouse:"mousemove"},cancel:{touch:"touchcancel",mouse:null},leave:{touch:"touchleave",mouse:"mouseleave"},end:{touch:"touchend",mouse:"mouseup"}},E=function(e){e.preventDefault(),g(e.target)},g=function(e){e.removeEventListener("click",E,!1);try{var t=parseInt(e.getAttribute("data-dd-tappable-click-canceller-id"),10);clearTimeout(t),e.removeAttribute("data-dd-tappable-click-canceller-id")}catch(e){}},h=function(e){g(e),e.addEventListener("click",E,!1);var t=setTimeout(function(){g(e)},500);e.setAttribute("data-dd-tappable-click-canceller-id",t)},m=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};a(this,e);var i=this;t.addEventListener||(n=t,t=document.documentElement),i.context=t,i.nowTouching=!1,i.beforePointerType=null,i.tapEventNameSuffix=n.tapEventNameSuffix||v,i.dragEventNameSuffix=n.dragEventNameSuffix||f,i.waitAnotherPointerType=n.waitAnotherPointerType||c,i.judgeTapCancelRange=n.judgeTapCancelRange||s,i.touchClassName=n.touchClassName||d;var u=null,p=!1,E=null,g=void 0,m=0,y=function e(t){p=!0,t.target.removeEventListener("dragstart",e,!1),b.end(t)},b={start:function(t){if(3!==t.which){var n=e.getPointerTypeByEvent(t);if((null===i.beforePointerType||i.beforePointerType===n)&&(E=n,!i.nowTouching)){u=t.target,i.nowTouching=!0,i.beforePointerType=E,p=!1,g=e.getPositionByEvent(t),m=0,u.addEventListener("dragstart",y,!1);var a=new l.default(i.tapEventNameSuffix+"start",t),o=u.dispatchEvent(a),c=new CustomEvent(i.dragEventNameSuffix+"start",{bubbles:!0,cancelable:!0,detail:{position:g}}),s=u.dispatchEvent(c);o&&s||h(u),o&&s||t.preventDefault(),setTimeout(function(){i.beforePointerType=null},i.waitAnotherPointerType),r(u,i.touchClassName);for(var d in e.POINTER_EVENTS_DEFINE)if("start"!==d){var v=e.POINTER_EVENTS_DEFINE[d][E];null!==v&&i.context.addEventListener(v,b[d],{passive:!1})}}}},move:function(t){var n=e.getPositionByEvent(t),a=e.getLengthByPosition(g,n);(m+=a)>=i.judgeTapCancelRange&&(p=!0);var r=new l.default(i.tapEventNameSuffix+"move",t),o=u.dispatchEvent(r),c=new CustomEvent(i.dragEventNameSuffix+"move",{bubbles:!0,cancelable:!0,detail:{position:n,moved:{x:n.x-g.x,y:n.y-g.y,length:m}}}),s=u.dispatchEvent(c);o&&s||h(u),o&&s||t.preventDefault()},cancel:function(e){p=!0},leave:function(e){p=!0},end:function(t){var n=e.getPositionByEvent(t),a=e.getLengthByPosition(g,n);m+=a;for(var r in e.POINTER_EVENTS_DEFINE)if("start"!==r){var c=e.POINTER_EVENTS_DEFINE[r][E];null!==c&&i.context.removeEventListener(c,b[r],!1)}o(u,i.touchClassName),setTimeout(function(){i.nowTouching=!1},0);var s=new CustomEvent(i.dragEventNameSuffix+"end",{bubbles:!0,cancelable:!0,detail:{position:n,moved:{x:n.x-g.x,y:n.y-g.y,length:m}}}),d=u.dispatchEvent(s);if(E=null,m=0,p)return void(p=!1);var v=new l.default(i.tapEventNameSuffix,t),f=u.dispatchEvent(v);d&&f||h(u),d&&f||t.preventDefault()}};for(var T in e.POINTER_EVENTS_DEFINE.start){var N=e.POINTER_EVENTS_DEFINE.start[T];"on"+N in window&&i.context.addEventListener(N,b.start,{passive:!1})}}return i(e,null,[{key:"getPositionByEvent",value:function(e){var t=e.changedTouches?e.changedTouches[0]:e;return{x:t.pageX,y:t.pageY}}},{key:"getPointerTypeByEvent",value:function(t){for(var n=0;n<e.POINTER_TYPES_DEFINE.length;n++){var a=e.POINTER_TYPES_DEFINE[n];if(0===t.type.indexOf(a))return a}}},{key:"getLengthByPosition",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null,r=void 0,o=void 0;return null===n?(r=e.x,o=e.y,n=t.x,a=t.y):(r=e,o=t),Math.sqrt(Math.pow(n-r,2)+Math.pow(a-o,2))}},{key:"dragStart",value:function(e){var t=e.target;t.setAttribute("dd-start-left",parseInt(t.style.left,10)||0),t.setAttribute("dd-start-top",parseInt(t.style.top,10)||0)}},{key:"dragMove",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=e.target,a=e.detail.moved,r=t.enclosure,o=parseInt(n.getAttribute("dd-start-left"),10)+a.x,i=parseInt(n.getAttribute("dd-start-top"),10)+a.y;if(!0===r||"parent"===r){var u=n.parentNode.getBoundingClientRect(),l=n.getBoundingClientRect(),c=u.width-l.width,s=u.height-l.height;o<0?o=0:o>c&&(o=c),i<0?i=0:i>s&&(i=s)}n.style.left=o+"px",n.style.top=i+"px"}},{key:"dragEnd",value:function(e){var t=e.target;t.removeAttribute("dd-start-left"),t.removeAttribute("dd-start-top")}},{key:"POINTER_EVENTS_DEFINE",get:function(){return p}},{key:"POINTER_TYPES_DEFINE",get:function(){return Object.keys(e.POINTER_EVENTS_DEFINE.start)}}]),e}();t.default=m},function(e,t,n){"use strict";function a(e,t){t=t||Object.create(null);var n=document.createEvent("Event");n.initEvent(e,t.bubbles||!1,t.cancelable||!1);for(var a,i=2;i<r.length;i++)a=r[i],n[a]=t[a]||o[i];n.buttons=t.buttons||0;var u=0;return u=t.pressure&&n.buttons?t.pressure:n.buttons?.5:0,n.x=n.clientX,n.y=n.clientY,n.pointerId=t.pointerId||0,n.width=t.width||0,n.height=t.height||0,n.pressure=u,n.tiltX=t.tiltX||0,n.tiltY=t.tiltY||0,n.twist=t.twist||0,n.tangentialPressure=t.tangentialPressure||0,n.pointerType=t.pointerType||"",n.hwTimestamp=t.hwTimestamp||0,n.isPrimary=t.isPrimary||!1,n.originalEvent=t,n}Object.defineProperty(t,"__esModule",{value:!0});var r=["bubbles","cancelable","view","detail","screenX","screenY","clientX","clientY","ctrlKey","altKey","shiftKey","metaKey","button","relatedTarget","pageX","pageY"],o=[!1,!1,null,null,0,0,0,0,!1,!1,!1,!1,0,null,0,0];t.default=a}]);
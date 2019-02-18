import TappableEvent from './TappableEvent';



// Polyfill For IE
(() => {
  if (typeof window.CustomEvent === 'function') return false;

  function CustomEvent(event, params) {
    params = params || {bubbles: false, cancelable: false, detail: undefined};
    let evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();



function addClassName(el, name) {
  removeClassName(el, name);
  el.className = el.className + ' ' + name;
}

function removeClassName(el, name) {
  el.className = el.className.split(name).join(' ').replace(/\s+/, ' ');
}

const WAIT_ANOTHER_POINTER_TYPE = 5000,
      JUDGE_TAP_CANCEL_RANGE    = 44,
      CLICK_CANCEL_RANGE        = 500,
      NAME_SPACE                = '',
      TOUCH_CLASS_NAME          = 'touch',
      TAP_EVENT_NAME_PREFIX     = 'tap',
      PAN_EVENT_NAME_PREFIX     = 'pan',
      LISTENER_OPTIONS          = {passive: false},
      POINTER_EVENTS_DEFINE     = {
        start: {
          // 'pointer': 'pointerdown',
          'touch'  : 'touchstart',
          'mouse'  : 'mousedown',
        },

        move: {
          // 'pointer': 'pointermove',
          'touch'  : 'touchmove',
          'mouse'  : 'mousemove',
        },

        cancel: {
          // 'pointer': 'pointercancel',
          'touch'  : 'touchcancel',
          'mouse'  : null,
        },

        leave: {
          // 'pointer': 'pointerleave',
          'touch'  : 'touchleave',
          'mouse'  : 'mouseleave',
        },

        // out: {
        //   // 'pointer': 'pointerout',
        //   'touch'  : null,
        //   'mouse'  : 'mouseout',
        // },

        end: {
          // 'pointer': 'pointerup',
          'touch'  : 'touchend',
          'mouse'  : 'mouseup',
        },
      };



export default class DDTappable {

  //
  // Statics
  //
  static get POINTER_EVENTS_DEFINE() { return POINTER_EVENTS_DEFINE }

  static get POINTER_TYPES_DEFINE() {
    return Object.keys(DDTappable.POINTER_EVENTS_DEFINE.start)
  }

  static getPositionByEvent(e) {
    const point = e.changedTouches ? e.changedTouches[0] : e;
    return {x: point.pageX, y: point.pageY};
  }

  static getPointerTypeByEvent(e) {
    for (let i = 0; i < DDTappable.POINTER_TYPES_DEFINE.length; i++) {
      const type = DDTappable.POINTER_TYPES_DEFINE[i];
      if (e.type.indexOf(type) === 0) {
        return type;
        break;
      }
    }
  }

  static getLengthByPosition(startPosition, endPosition, x2 = null, y2 = null) {
    let x1, y1;
    if (x2 === null) {
      x1 = startPosition.x;
      y1 = startPosition.y;
      x2 = endPosition.x;
      y2 = endPosition.y;
    } else {
      x1 = startPosition;
      y1 = endPosition;
    }
    return Math.sqrt(Math.pow(x2 - x1 , 2) + Math.pow(y2 - y1 , 2));
  }

  static panStart(e) {
    const el = e.target;
    el.setAttribute('data-dd-tap-start-left', parseInt(el.style.left, 10) || 0);
    el.setAttribute('data-dd-tap-start-top', parseInt(el.style.top, 10) || 0);
  }

  static panMove(e, opt = {}) {
    const el        = e.target;
    const moved     = e.detail.moved;
    const enclosure = opt.enclosure;

    let nx = parseInt(el.getAttribute('data-dd-tap-start-left'), 10) + moved.x;
    let ny = parseInt(el.getAttribute('data-dd-tap-start-top'), 10) + moved.y;

    if (enclosure === true || enclosure === 'parent') {
      const parentRect = el.parentNode.getBoundingClientRect(),
            myRect = el.getBoundingClientRect();

      const maxLeft = parentRect.width - myRect.width;
      const maxTop = parentRect.height - myRect.height;

      if (nx < 0) {
        nx = 0;
      } else if (nx > maxLeft) {
        nx = maxLeft;
      }
      if (ny < 0) {
        ny = 0;
      } else if (ny > maxTop) {
        ny = maxTop;
      }
    }

    el.style.left = `${nx}px`;
    el.style.top = `${ny}px`;
  }

  static panEnd(e) {
    const el = e.target;
    el.removeAttribute('data-dd-tap-start-left');
    el.removeAttribute('data-dd-tap-start-top');
  }



  /**
   * constructor
   */
  constructor(context = {}, opt = {}) {
    const my = this;

    if (!context.addEventListener) {
      opt = context;
      context = document.documentElement;
    }

    my.context                = context;
    my.nowTouching            = false;
    my.beforePointerType      = null;
    my.nameSpace              = opt.nameSpace === undefined ? NAME_SPACE : opt.nameSpace;
    my.tapEventNamePrefix     = opt.tapEventNamePrefix     || TAP_EVENT_NAME_PREFIX;
    my.panEventNamePrefix     = opt.panEventNamePrefix     || PAN_EVENT_NAME_PREFIX;
    my.waitAnotherPointerType = opt.waitAnotherPointerType || WAIT_ANOTHER_POINTER_TYPE;
    my.judgeTapCancelRange    = opt.judgeTapCancelRange    || JUDGE_TAP_CANCEL_RANGE;
    my.touchClassName         = opt.touchClassName         || TOUCH_CLASS_NAME;

    let $target           = null,
        isCancel          = false,
        pointerType       = null,
        startPosition,
        moveLength = 0;

    const onPanstart = (e) => {
      isCancel = true;
      e.target.removeEventListener('dragstart', onPanstart, false);
      listeners.end(e);
    }

    const listeners = {

      /**
       * start
       */
      start(e) {
        if (e.which === 3) return;

        const catchedPointerType = DDTappable.getPointerTypeByEvent(e);

        // 前回と異なるポインタータイプであればキャンセル
        if (my.beforePointerType !== null && my.beforePointerType !== catchedPointerType) return;

        pointerType = catchedPointerType;

        // タッチ中であればキャンセル
        if (my.nowTouching) return;

        // タッチ開始
        $target              = e.target;
        my.nowTouching       = true;
        my.beforePointerType = pointerType;
        isCancel             = false;
        startPosition        = DDTappable.getPositionByEvent(e);
        moveLength           = 0;

        $target.addEventListener('dragstart', onPanstart, false);

        const tappableEvent = new TappableEvent(my.nameSpace + my.tapEventNamePrefix + 'start', e, {cancelable: true});
        const dispatchTapStartResult = $target.dispatchEvent(tappableEvent);

        const panStartEvent = new CustomEvent(my.nameSpace + my.panEventNamePrefix + 'start', {bubbles: true, cancelable: true, detail: {position: startPosition}});
        const dispatchPanStartResult = $target.dispatchEvent(panStartEvent);

        if (!dispatchTapStartResult || !dispatchPanStartResult) e.preventDefault();

        setTimeout(() => {
          my.beforePointerType = null;
        }, my.waitAnotherPointerType);

        addClassName($target, my.touchClassName);
        // $target.className = $target.className.split(my.touchClassName).join(' ').replace(/\s+/, '');
        // $target.classList.add(my.touchClassName);

        for (let key in DDTappable.POINTER_EVENTS_DEFINE) {
          if (key === 'start') continue;

          const eventName = DDTappable.POINTER_EVENTS_DEFINE[key][pointerType];

          if (eventName !== null) {
            my.context.addEventListener(eventName, listeners[key], LISTENER_OPTIONS);
            // $target.addEventListener(eventName, listeners[key], {passive: false});
          }

          // if (eventName === 'mouseup') {
          //   window.addEventListener(eventName, listeners[key], {passive: false});
          // }
        }
      },



      /**
       * move
       */
      move(e) {
        const currentPosition = DDTappable.getPositionByEvent(e),
              length          = DDTappable.getLengthByPosition(startPosition, currentPosition);

        moveLength += length;

        if (moveLength >= my.judgeTapCancelRange) isCancel = true;

        const tappableEvent = new TappableEvent(my.nameSpace + my.tapEventNamePrefix + 'move', e, {cancelable: true});
        const dispatchTapMoveResult = $target.dispatchEvent(tappableEvent);

        const panMoveEvent = new CustomEvent(my.nameSpace + my.panEventNamePrefix + 'move', {bubbles: true, cancelable: true, detail: {
          position: currentPosition,
          moved: {
            x: currentPosition.x - startPosition.x,
            y: currentPosition.y - startPosition.y,
            length: moveLength,
          },
        }});
        const dispatchPanMoveResult = $target.dispatchEvent(panMoveEvent);

        if (!dispatchTapMoveResult || !dispatchPanMoveResult) {
          e.preventDefault();
        }
      },



      /**
       * cancel
       */
      cancel(e) { isCancel = true; },



      /**
       * leave
       */
      leave(e) { isCancel = true; },



      /**
       * end
       */
      end(e) {
        const currentPosition = DDTappable.getPositionByEvent(e),
              length          = DDTappable.getLengthByPosition(startPosition, currentPosition);

        moveLength += length;

        for (let key in DDTappable.POINTER_EVENTS_DEFINE) {
          if (key === 'start') continue;

          const eventName = DDTappable.POINTER_EVENTS_DEFINE[key][pointerType];

          if (eventName !== null) {
            my.context.removeEventListener(eventName, listeners[key], LISTENER_OPTIONS);
            // $target.removeEventListener(eventName, listeners[key], false);
          }

          // if (eventName === 'mouseup') {
          //   window.removeEventListener(eventName, listeners[key], false);
          // }
        }

        removeClassName($target, my.touchClassName);
        // $target.classList.remove(my.touchClassName);

        setTimeout(() => {
          my.nowTouching = false;
        }, 0);

        const panEndEvent = new CustomEvent(my.nameSpace + my.panEventNamePrefix + 'end', {bubbles: true, cancelable: true, detail: {
          position: currentPosition,
          moved: {
            x: currentPosition.x - startPosition.x,
            y: currentPosition.y - startPosition.y,
            length: moveLength,
          },
        }});
        let dispatchPanEndResult = $target.dispatchEvent(panEndEvent);

        pointerType = null;
        moveLength  = 0;

        if (isCancel) {
          isCancel = false;
          return;
        }

        const tappableEvent = new TappableEvent(my.nameSpace + my.tapEventNamePrefix, e, {cancelable: true});
        let dispatchTapResult = $target.dispatchEvent(tappableEvent);

        if (!dispatchPanEndResult || !dispatchTapResult) e.preventDefault();
      },
    };



    // bind start event for context element
    for (let key in DDTappable.POINTER_EVENTS_DEFINE.start) {
      const eventName = DDTappable.POINTER_EVENTS_DEFINE.start[key];

      if (eventName, 'on' + eventName in window) {
        my.context.addEventListener(eventName, listeners.start, LISTENER_OPTIONS);
      }
    }
  }
}

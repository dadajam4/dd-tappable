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
      TOUCH_CLASS_NAME          = 'dd-touch',
      TAP_EVENT_NAME_SUFFIX     = 'dd-tap',
      DRAG_EVENT_NAME_SUFFIX    = 'dd-drag',
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




const clickCanceller = e => {
  e.preventDefault();
  removeClickCanceller(e.target);
}

const removeClickCanceller = (el) => {
  el.removeEventListener('click', clickCanceller, false);
  try {
    const timerId = parseInt(el.getAttribute('data-dd-tappable-click-canceller-id'), 10);
    clearTimeout(timerId);
    el.removeAttribute('data-dd-tappable-click-canceller-id');
  } catch(e) {}
}

const setClickCanceller = (el) => {
  removeClickCanceller(el);
  el.addEventListener('click', clickCanceller, false);
  const timerId = setTimeout(() => {
    removeClickCanceller(el);
  }, CLICK_CANCEL_RANGE);
  el.setAttribute('data-dd-tappable-click-canceller-id', timerId);
}



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

  static dragStart(e) {
    const el = e.target;
    el.setAttribute('dd-start-left', parseInt(el.style.left, 10) || 0);
    el.setAttribute('dd-start-top', parseInt(el.style.top, 10) || 0);
  }

  static dragMove(e, opt = {}) {
    const el        = e.target;
    const moved     = e.detail.moved;
    const enclosure = opt.enclosure;

    let nx = parseInt(el.getAttribute('dd-start-left'), 10) + moved.x;
    let ny = parseInt(el.getAttribute('dd-start-top'), 10) + moved.y;

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

  static dragEnd(e) {
    const el = e.target;
    el.removeAttribute('dd-start-left');
    el.removeAttribute('dd-start-top');
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
    my.tapEventNameSuffix     = opt.tapEventNameSuffix     || TAP_EVENT_NAME_SUFFIX;
    my.dragEventNameSuffix    = opt.dragEventNameSuffix    || DRAG_EVENT_NAME_SUFFIX;
    my.waitAnotherPointerType = opt.waitAnotherPointerType || WAIT_ANOTHER_POINTER_TYPE;
    my.judgeTapCancelRange    = opt.judgeTapCancelRange    || JUDGE_TAP_CANCEL_RANGE;
    my.touchClassName         = opt.touchClassName         || TOUCH_CLASS_NAME;

    let $target           = null,
        isCancel          = false,
        pointerType       = null,
        startPosition,
        moveLength = 0;

    const onDragstart = (e) => {
      isCancel = true;
      e.target.removeEventListener('dragstart', onDragstart, false);
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

        $target.addEventListener('dragstart', onDragstart, false);

        const tappableEvent = new TappableEvent(my.tapEventNameSuffix + 'start', e);
        const dispatchTapStartResult = $target.dispatchEvent(tappableEvent);

        const dragStartEvent = new CustomEvent(my.dragEventNameSuffix + 'start', {bubbles: true, cancelable: true, detail: {position: startPosition}});
        const dispatchDragStartResult = $target.dispatchEvent(dragStartEvent);

        if (!dispatchTapStartResult || !dispatchDragStartResult) setClickCanceller($target);
        if (!dispatchTapStartResult || !dispatchDragStartResult) e.preventDefault();

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
            my.context.addEventListener(eventName, listeners[key], {passive: false});
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

        const tappableEvent = new TappableEvent(my.tapEventNameSuffix + 'move', e);
        const dispatchTapMoveResult = $target.dispatchEvent(tappableEvent);

        const dragMoveEvent = new CustomEvent(my.dragEventNameSuffix + 'move', {bubbles: true, cancelable: true, detail: {
          position: currentPosition,
          moved: {
            x: currentPosition.x - startPosition.x,
            y: currentPosition.y - startPosition.y,
            length: moveLength,
          },
        }});
        const dispatchDragMoveResult = $target.dispatchEvent(dragMoveEvent);

        if (!dispatchTapMoveResult || !dispatchDragMoveResult) setClickCanceller($target);
        if (!dispatchTapMoveResult || !dispatchDragMoveResult) e.preventDefault();
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
            my.context.removeEventListener(eventName, listeners[key], false);
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

        const dragEndEvent = new CustomEvent(my.dragEventNameSuffix + 'end', {bubbles: true, cancelable: true, detail: {
          position: currentPosition,
          moved: {
            x: currentPosition.x - startPosition.x,
            y: currentPosition.y - startPosition.y,
            length: moveLength,
          },
        }});
        let dispatchDragEndResult = $target.dispatchEvent(dragEndEvent);

        pointerType = null;
        moveLength  = 0;

        if (isCancel) {
          isCancel = false;
          return;
        }

        const tappableEvent = new TappableEvent(my.tapEventNameSuffix, e);
        let dispatchTapResult = $target.dispatchEvent(tappableEvent);

        if (!dispatchDragEndResult || !dispatchTapResult) setClickCanceller($target);
        if (!dispatchDragEndResult || !dispatchTapResult) e.preventDefault();
      },
    };



    // bind start event for context element
    for (let key in DDTappable.POINTER_EVENTS_DEFINE.start) {
      const eventName = DDTappable.POINTER_EVENTS_DEFINE.start[key];

      if (eventName, 'on' + eventName in window) {
        my.context.addEventListener(eventName, listeners.start, {passive: false});
      }
    }
  }
}

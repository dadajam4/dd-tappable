'use strict';



const MOUSE_PROPS = [
  'bubbles',
  'cancelable',
  'view',
  'detail',
  'screenX',
  'screenY',
  'clientX',
  'clientY',
  'ctrlKey',
  'altKey',
  'shiftKey',
  'metaKey',
  'button',
  'relatedTarget',
  'pageX',
  'pageY'
];

const MOUSE_DEFAULTS = [
  false,
  false,
  null,
  null,
  0,
  0,
  0,
  0,
  false,
  false,
  false,
  false,
  0,
  null,
  0,
  0
];



function TappableEvent(inType, inDict) {
  inDict = inDict || Object.create(null);

  const e = document.createEvent('Event');
  e.initEvent(inType, inDict.bubbles || false, inDict.cancelable || false);

  for (let i = 2, p; i < MOUSE_PROPS.length; i++) {
    p = MOUSE_PROPS[i];
    e[p] = inDict[p] || MOUSE_DEFAULTS[i];
  }
  e.buttons = inDict.buttons || 0;

  let pressure = 0;

  if (inDict.pressure && e.buttons) {
    pressure = inDict.pressure;
  } else {
    pressure = e.buttons ? 0.5 : 0;
  }

  e.x = e.clientX;
  e.y = e.clientY;

  e.pointerId          = inDict.pointerId || 0;
  e.width              = inDict.width || 0;
  e.height             = inDict.height || 0;
  e.pressure           = pressure;
  e.tiltX              = inDict.tiltX || 0;
  e.tiltY              = inDict.tiltY || 0;
  e.twist              = inDict.twist || 0;
  e.tangentialPressure = inDict.tangentialPressure || 0;
  e.pointerType        = inDict.pointerType || '';
  e.hwTimestamp        = inDict.hwTimestamp || 0;
  e.isPrimary          = inDict.isPrimary || false;
  e.originalEvent      = inDict;
  return e;
}



export default TappableEvent;

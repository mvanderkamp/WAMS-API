/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('../src/server');
const ws = new WAMS.WamsServer();

// Executed every time a user taps or clicks a screen
const handleClick = (function makeClickHandler(ws) {
  const colours = [
    'blue',
    'red',
    'green',
    'pink',
    'cyan',
    'yellow',
  ];

  function rectSeq(index) {
    const seq = new WAMS.Sequence();
    seq.fillStyle = colours[index];
    seq.fillRect('{x}', '{y}', '{width}', '{height}');
    return seq;
  }

  function square(ix, iy, index) {
    const x = ix - 64;
    const y = iy - 64;
    const width = 128;
    const height = 128;
    const type = 'colour';
    const blueprint = rectSeq(index);
    return {x, y, width, height, type, blueprint};
  }

  function handleClick(viewer, target, x, y) {
    if (target.type === 'colour') {
      ws.removeItem(target);
    } else {
      ws.spawnItem(square(x, y, viewer.id % 6));
    }
  }

  return handleClick;
})(ws);

// Executed every time a drag occurs on a device
function handleDrag(viewer, target, x, y, dx, dy) {
  if (target.type === 'colour') {
    target.moveBy(dx, dy);
  } else if (target.type === 'view/background') {
    target.moveBy(-dx, -dy);
  }
  ws.update(target);
}

// Executed when a user pinches a device, or uses the scroll wheel on a computer
function handleScale(viewer, newScale) {
  viewer.rescale(newScale);
  ws.update(viewer);
}

// Attaches the defferent function handlers
ws.on('click', handleClick);
ws.on('scale', handleScale);
ws.on('drag',  handleDrag);

ws.listen(9002);


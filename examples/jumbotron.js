/*
 * This example is intended to demonstrate having multiple users move their
 *  view around in a shared space.
 */

'use strict';

const path = require('path');
const Wams = require('../src/server');

const router = new Wams.Router();
const images = path.join(__dirname, '../img');
router.use('/img', router.express.static(images));

const ws = new Wams({
  bounds: { x: 3600, y: 5445 },
  clientLimit: 4,
}, router);

ws.spawnItem({
  imgsrc: 'img/monaLisa.jpg',
  type: 'mona',
  scale: 5
});

// Example Layout function that takes in the newly added client and which 
//  ws they joined. Lays out views in a decending staircase pattern
const handleLayout = (function makeLayoutHandler() {
  let table = null;
  const OVERLAP = 30;

  const TABLE   = 0;
  const RIGHT   = 1;
  const LEFT    = 2;
  const BOTTOM  = 3;

  function layoutTable(view) {
    table = view;
  };

  function layoutLeft(view) {
    const anchor = table.bottomLeft.minus({ x: 0, y: OVERLAP });
    view.moveTo( anchor.x, anchor.y );
  };

  function layoutRight(view) {
    const anchor = table.topRight.minus({ x: OVERLAP, y: 0 });
    view.moveTo( anchor.x, anchor.y );
  };

  function layoutBottom(view) {
    const anchor = table.bottomRight.minus({ x: OVERLAP, y: OVERLAP });
    view.moveTo( anchor.x, anchor.y );
  };

  function dependOnTable(fn) {
    return function layoutDepender(view) {
      if (!table) {
        setTimeout( () => layoutDepender(view), 0 ); 
      } else {
        fn(view);
      }
    };
  }

  const user_fns = [];
  user_fns[TABLE]   = layoutTable;
  user_fns[RIGHT]   = dependOnTable( layoutRight );
  user_fns[LEFT]    = dependOnTable( layoutLeft );
  user_fns[BOTTOM]  = dependOnTable( layoutBottom );

  function handleLayout(view, position) {
    user_fns[position](view);
  }

  return handleLayout;
})();

ws.on('layout', handleLayout);
ws.on('drag',   Wams.predefined.drag.view(ws));
ws.on('scale',  Wams.predefined.scale.view(ws));

ws.listen(9000);


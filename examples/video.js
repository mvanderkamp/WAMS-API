/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application();

function topbarred(html) {
  return '<div>' + 
    '<div width="560" height="50" ' +
    'style="background-color:green; height:50px;"></div>' +
    html +
    '</div>';
}

app.spawnElement(
  Wams.predefined.items.wrappedElement(
    topbarred('<iframe width="560" height="315" src="https://www.youtube.com/embed/RONIax0_1ec" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'),
    560,
    50,
    {
      x: 400,
      y: 50,
      width: 560,
      height: 365,
      type:  'video',
    }
  )
);

app.spawnElement(
  Wams.predefined.items.wrappedElement(
    topbarred('<iframe width="560" height="315" src="https://www.youtube.com/embed/l5I8jaMsHYk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'),
    560,
    50,
    {
      x: 400,
      y: 465,
      width: 560,
      height: 365,
      type:  'video',
    }
  )
);

// Attaches the different function handlers
app.on('scale',  Wams.predefined.scales.itemsAndView(['video']));
app.on('drag',   Wams.predefined.drags.itemsAndView(['video']));
app.on('rotate', Wams.predefined.rotates.itemsAndView(['video']));

app.listen(9002);

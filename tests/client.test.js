/*
 * If Jest will work with client-side code, this file will test out the client
 * side of the WAMS API.
 */

'use strict';

const client = require('../src/client.js');
const ClientViewer = client.ClientViewer;
const ClientItem = client.ClientItem;
const ClientController = client.ClientController;
const ShadowViewer = client.ShadowViewer;

expect.extend({
  toHaveImmutableProperty(received, argument) {
    const descs = Object.getOwnPropertyDescriptor(received, argument);
    const pass = Boolean(descs && !(descs.configurable || descs.writable));
    const not = pass ? 'not ' : ''
    return {
      message: () =>
        `expected ${received} ${not}to have immutable property '${argument}'`,
      pass: pass,
    };
  },
});

describe('ShadowViewer', () => {
  const viewer = {
    x: 43,
    y: 42,
    effectiveWidth: 900,
    effectiveHeight: 120,
    id: 1,
  };

  describe('constructor(values)', () => {
    const DEFAULTS = Object.freeze({
      x: 0,
      y: 0,
      effectiveWidth: window.innerWidth,
      effectiveHeight: window.innerHeight,
    })
    test('Throws exception if no values provided', () => {
      expect(() => new ShadowViewer()).toThrow();
    });

    test('Uses defined values, if provided', () => {
      expect(new ShadowViewer(viewer)).toMatchObject(viewer);
    });
  });

  describe('draw(context)', () => {
    const sv = new ShadowViewer(viewer);
    const ctx = {
      beginPath: jest.fn(),
      rect: jest.fn(),
      stroke: jest.fn(),
    }

    test('Throws exception if no context provided', () => {
      expect(() => sv.draw()).toThrow();
    });

    test('Draws a rectangle representing the shadow viewer', () => {
      expect(() => sv.draw(ctx)).not.toThrow();
      expect(ctx.beginPath).toHaveBeenCalledTimes(1);
      expect(ctx.beginPath).toHaveBeenLastCalledWith();
      expect(ctx.rect).toHaveBeenCalledTimes(1);
      expect(ctx.rect).toHaveBeenLastCalledWith(
        sv.x, sv.y, sv.effectiveWidth, sv.effectiveHeight
      );
      expect(ctx.stroke).toHaveBeenCalledTimes(1);
      expect(ctx.stroke).toHaveBeenLastCalledWith();
    });
  });
});

describe('ClientItem', () => {
  const item = {
    x: 42, y: 43, width: 800, height: 97,
    type: 'booyah', imgsrc: 'home', id: 3
  };

  describe('constructor(data)', () => {
    test('Constructs an object of the correct type', () => {
      expect(new ClientItem(item)).toBeInstanceOf(ClientItem);
    });

    test('Throws exception if no data provided', () => {
      expect(() => new ClientItem()).toThrow();
    });

    test('Uses input values, if provided', () => {
      const ci = new ClientItem(item);
      Object.keys(item).forEach( k => {
        expect(ci[k]).toBe(item[k]);
      });
    });

    test('If data has an ID, stamps it immutably onto the item', () => {
      item.id = 4;
      const ci = new ClientItem(item);
      expect(ci).toHaveImmutableProperty('id');
      expect(ci.id).toBe(4);
    });

    test('Creates an image, if data provides an imgsrc', () => {
      const ci = new ClientItem(item);
      expect(ci).toHaveProperty('img');
      expect(ci.img).toBeInstanceOf(Image);
      expect(ci.img.src).toBe(item.imgsrc);
    });

    test('Does not create an image, if no imgsrc provided', () => {
      const ci = new ClientItem({x:10,y:12,id:42});
      expect(ci.img).toBeNull();
    });
  });

  describe('draw(context)', () => {
    const ctx = { drawImage: jest.fn() };

    test('Throws an exception if no context provided', () => {
      const ci = new ClientItem(item);
      console.log(ci);
      expect(() => ci.draw()).toThrow();
    });

    test('If an image is provided, draws an image', () => {
      const ci = new ClientItem(item);
      expect(() => ci.draw(ctx)).not.toThrow();
      expect(ctx.drawImage).toHaveBeenCalledTimes(1);
      expect(ctx.drawImage).toHaveBeenLastCalledWith(
        ci.img, ci.x, ci.y, ci.width, ci.height
      );
    });
  });
});

describe('ClientViewer', () => {
  const DEFAULTS = Object.freeze({ x: 0, y: 0, rotation: 0, scale: 1, });
  const item = {
    x:42, y:43, width:80, height:97, 
    type:'booyah', imgsrc:'home', id: 11
  };
  const shadow = { 
    x: 43, y: 42, 
    effectiveWidth: 900, effectiveHeight: 120, id: 25
  };

  describe('constructor(values)', () => {
    test('Creates correct type of object', () => {
      expect(new ClientViewer()).toBeInstanceOf(ClientViewer);
    });

    test('Uses defaults if no values provided', () => {
      expect(new ClientViewer()).toMatchObject(DEFAULTS);
    });

    test('Uses provided values', () => {
      const custom = Object.freeze({ x: 42, y: 43, });
      const cv = new ClientViewer(custom);
      expect(cv).toMatchObject(custom);
      expect(cv.rotation).toBe(DEFAULTS.rotation);
      expect(cv.scale).toBe(DEFAULTS.scale);
    });

    test('Resizes to fill the window', () => {
      const cv = new ClientViewer({width: 100, height: 255});
      expect(cv.width).toBe(window.innerWidth);
      expect(cv.height).toBe(window.innerHeight);
    });
  });

  describe('addItem(values)', () => {
    const cv = new ClientViewer();
    test('Throws exception if no values provided', () => {
      expect(() => cv.addItem()).toThrow();
    });

    test('Adds a ClientItem using the provided values', () => {
      expect(() => cv.addItem(item)).not.toThrow();
      expect(cv.items[0]).toMatchObject(item);
      expect(cv.items[0]).toBeInstanceOf(ClientItem);
    });
  });

  describe('addShadow(values)', () => {
    const cv = new ClientViewer();
    test('Throws exception if no values provided', () => {
      expect(() => cv.addShadow()).toThrow();
    });

    test('Adds a ShadowViewer using the provided values', () => {
      expect(() => cv.addShadow(shadow)).not.toThrow();
      expect(cv.shadows[0]).toMatchObject(shadow);
      expect(cv.shadows[0]).toBeInstanceOf(ShadowViewer);
    });
  });

  describe('draw(context)', () => {
    // To be tested...
  });

  describe('removeItem(item)', () => {
    const cv = new ClientViewer();
    cv.addItem({x:555, y:253, id:50});
    cv.addItem(item);
    cv.addItem({x:1,y:2, id:89});

    test('Throws exception if no item provided', () => {
      expect(() => cv.removeItem()).toThrow();
    });

    test('Removes the item', () => {
      const i = cv.items[1];
      expect(() => cv.removeItem(i)).not.toThrow();
      expect(cv.items.length).toBe(2);
      expect(cv.items).not.toContain(i);
    });
  });

  describe('removeViewer(viewer)', () => {
  });

  describe('resizeToFillWindow()', () => {
  });

  describe('setup(data)', () => {
  });

  describe('updateItem(data)', () => {
  });

  describe('updateShadow(data)', () => {
  });
});

describe('ClientController', () => {
  describe('constructor(canvas)', () => {
  });

  describe('drag(event)', () => {
  });

  describe('dragend(event)', () => {
  });

  describe('dragstart(event)', () => {
  });

  describe('getMouseCoordinates(event)', () => {
  });

  describe('resize()', () => {
  });

  describe('run()', () => {
  });

  describe('scroll(event)', () => {
  });

  describe('sendUpdate()', () => {
  });

  describe('tap(event)', () => {
  });

  describe('transform(event)', () => {
  });

  describe('transformend(event)', () => {
  });

  describe('transformstart(event)', () => {
  });
});



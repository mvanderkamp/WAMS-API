/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The Interactor class provides a layer of abstraction between the
 * ClientController and the code that processes user inputs.
 */

'use strict';

// const Westures = require('../../../westures');
const Westures = require('westures');
const { mergeMatches, NOP } = require('../shared.js');

const HANDLERS = Object.freeze({ 
  pan:    NOP,
  rotate: NOP,
  swipe:  NOP,
  tap:    NOP,
  zoom:   NOP,
});

/**
 * Currently, the Interactor makes use of the Westures library.
 *
 * General Design:
 *  The handlers will get called with the arguments that need to be reported
 *  through to the server. This allows the ClientController to use this class
 *  in a very simple way. This is the contract between the Interactor and the
 *  ClientController, and must be honoured.
 *
 *  The handlers are initialized to NOPs so that the functions which call the
 *  handlers don't need to check whether the handler exists.
 *
 *  The methods of this class that are similarly named as the handlers are
 *  there as an intermediary to collect data from events and call the handlers
 *  with only the requisite data.
 */
class Interactor {
  /**
   * canvas  : The <canvs> element on which to listen for interaction events.
   * handlers: Object with keys as the names gestures and values as the
   *           corresponding function for handling that gesture when it is
   *           recognized.
   */
  constructor(canvas, handlers = {}) {
    this.canvas = canvas;
    this.region = new Westures.Region(window, true, true);
    this.handlers = mergeMatches(HANDLERS, handlers);
    this.bindRegions();
    window.addEventListener('wheel', this.wheel.bind(this), false);
  }

  /**
   * Westures uses Gesture objects, and expects those objects to be bound to an
   * element, along with a handler for responding to that gesture. This method
   * takes care of those activities.
   */
  bindRegions() {
    const pan     = this.pan.bind(this);
    const tap     = this.tap.bind(this);
    const pinch   = this.pinch.bind(this);
    const rotate  = this.rotate.bind(this);
    const swipe   = this.swipe.bind(this);

    this.region.bind(this.canvas, this.panner(), pan);
    this.region.bind(this.canvas, this.tapper(), tap);
    this.region.bind(this.canvas, this.pincher(), pinch);
    this.region.bind(this.canvas, this.rotater(), rotate);
    this.region.bind(this.canvas, this.swiper(), swipe);
  }

  /**
   * Transform data received from Westures and forward to the registered
   * handler.
   */
  pan({ detail }) {
    const { change, point, phase } = detail;
    this.handlers.pan( point.x, point.y, change.x, change.y, phase);
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  panner() {
    return new Westures.Pan();
  }

  /**
   * Transform data received from Westures and forward to the registered
   * handler.
   */
  pinch({ detail }) {
    this.handlers.zoom(detail.change * 0.0025);
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  pincher() {
    return new Westures.Pinch({ minInputs: 3 });
  }

  /**
   * Transform data received from Westures and forward to the registered
   * handler.
   */
  rotate({ detail }) {
    this.handlers.rotate( detail.delta );
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  rotater() {
    return new Westures.Rotate();
  }

  /**
   * Transform data received from Westures and forward to the registered
   * handler.
   */
  swipe({ detail }) {
    const { velocity, x, y, direction } = detail;
    this.handlers.swipe(velocity, x, y, direction);
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  swiper() {
    return new Westures.Swipe();
  }

  /**
   * Transform data received from Westures and forward to the registered
   * handler.
   */
  tap({ detail }) {
    this.handlers.tap( detail.x, detail.y );
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  tapper() {
    return new Westures.Tap({ tolerance: 4 });
  }

  /**
   * Treat scrollwheel events as zoom events.
   */
  wheel(event) {
    event.preventDefault();
    const factor = event.ctrlKey ? 0.10 : 0.02;
    this.handlers.zoom(-(Math.sign(event.deltaY) * factor));
  }
}

module.exports = Interactor;


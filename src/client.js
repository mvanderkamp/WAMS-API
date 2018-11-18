/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * This file defines the entry point for the client side of a WAMS application.
 */

'use strict';

const ClientController = require('./client/ClientController.js');

window.addEventListener(
  'load', 
  function run() {
    new ClientController(document.querySelector('canvas'));
  },
  {
    capture: false,
    once: true,
    passive: true,
  }
);


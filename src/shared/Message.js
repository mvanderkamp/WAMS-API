/*
 * Shared Message class for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 *
 * The purpose of this class is to provide a funnel through which all messages
 * between client and server must pass. In concert with the Reporter interface,
 * it allows for a sanity check such that the correct sort of data is getting
 * passed back and forth.
 *
 * Unfortunately this does not provide a strict guarantee that informal and ad
 * hoc messages aren't getting emitted somewhere, so it is up to the programmer
 * to be disciplined and adhere to the Message / Reporter principle.
 */

'use strict';

const { defineOwnImmutableEnumerableProperty } = require('./utilities.js');

/**
 * TYPES is an explicit list of the types of messages that will be passed back
 * and forth. Messages not on this list should be ignored!
 *
 * @enum {string}
 * @readonly
 * @lends module:shared.Message
 */
const TYPES = {
  // For the server to inform about changes to the model
  /** @const */ ADD_ELEMENT: 'wams-add-element',
  /** @const */ ADD_IMAGE:   'wams-add-image',
  /** @const */ ADD_ITEM:    'wams-add-item',
  /** @const */ ADD_SHADOW:  'wams-add-shadow',
  /** @const */ RM_ITEM:     'wams-remove-item',
  /** @const */ RM_SHADOW:   'wams-remove-shadow',
  /** @const */ UD_ITEM:     'wams-update-item',
  /** @const */ UD_SHADOW:   'wams-update-shadow',
  /** @const */ UD_VIEW:     'wams-update-view',

  // For hopefully occasional extra adjustments to objects in the model.
  /** @const */ RM_ATTRS:   'wams-remove-attributes',
  /** @const */ SET_ATTRS:  'wams-set-attributes',
  /** @const */ SET_IMAGE:  'wams-set-image',
  /** @const */ SET_RENDER: 'wams-set-render',

  // Connection establishment related (disconnect, initial setup)
  /** @const */ INITIALIZE: 'wams-initialize',
  /** @const */ LAYOUT:     'wams-layout',
  /** @const */ FULL:       'wams-full',

  // User event related
  /** @const */ CLICK:      'wams-click',
  /** @const */ RESIZE:     'wams-resize',
  /** @const */ SWIPE:      'wams-swipe',
  /** @const */ TRACK:      'wams-track',
  /** @const */ TRANSFORM:  'wams-transform',

  // Multi-device gesture related
  /** @const */ POINTER:    'wams-pointer',
  /** @const */ BLUR:       'wams-blur',

  // Page event related
  /** @const */ IMG_LOAD:   'wams-image-loaded',
};
Object.freeze(TYPES);

const TYPE_VALUES = Object.freeze(Object.values(TYPES));

/**
 * The Message class provides a funnel through which data passed between the
 * client and server must flow.
 *
 * If an invalid type is received, the constructor throws an exception. If an
 * invalid reporter is received, an exception will not be thrown until
 * 'emitWith()' is called.
 *
 * @memberof module:shared
 *
 * @throws TypeError
 *
 * @param {string} type - The message type. Must be one of the explicitly listed
 * message types available on the Message object.
 * @param {module:shared.Reporter} reporter - A Reporter instance, containing
 * the data to be emitted.
 */
class Message {
  constructor(type, reporter) {
    if (!TYPE_VALUES.includes(type)) {
      throw new TypeError('Invalid message type!');
    }

    /**
     * The type of Message. Must be one of the predefined types available as
     * static fields on the Message class.
     *
     * @type {string}
     */
    this.type = type;

    /**
     * The Reporter which holds the data to send in the Message.
     *
     * @type {module:shared.Reporter}
     */
    this.reporter = reporter;
  }

  /**
   * Emits the data contained in the reporter along the channel defined by
   * emitter.
   *
   * @param {Emitter} emitter - An object capable of emitting data packets. Must
   * have an 'emit()' function.
   */
  emitWith(emitter) {
    emitter.emit(this.type, this.reporter.report());
  }
}

/*
 * Only define the messages once, above, and now attach them to the Message
 * Class object for external reference.
 */
Object.entries(TYPES).forEach(([p, v]) => {
  defineOwnImmutableEnumerableProperty(Message, p, v);
});

module.exports = Message;


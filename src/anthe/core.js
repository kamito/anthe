
import _ from 'lodash';
import Immutable from 'immutable';
import logger from './logger';
import Emitter from './emitter';
import { $REDUCE_ERROR_EMIT_KEY } from './const';

/**
 * Anthe.Core
 * @class
 */
class Core {

  /**
   * @constructor
   */
  constructor() {
    /**
     * Action map.
     * @type {Immutable.Map}
     */
    this.actionMap = Immutable.Map();

    /**
     * Action emitter.
     * @type {Emitter}
     */
    this.actionEmitter = new Emitter({ wildcard: true });
    this.actionEmitter.on('*', this.onAction.bind(this));

    /**
     * Reduce emitter.
     * @type {Emitter}
     */
    this.reduceEmitter = new Emitter({ wildcard: true });
  }

  /**
   * Triggered action.
   * @param {string} actionName Action name
   * @param {...} args Arguments.
   */
  onAction(actionName, ...args) {
    let callbacks = this.getAction(actionName);
    if (callbacks.size > 0) {
      Promise
        .all(_.map(callbacks.toArray(), (callback) => {
          return new Promise((resolve, reject) => {
            try {
              let rets = callback(...args);
              resolve(rets);
            } catch (err) {
              reject(err);
            };
          });
        }))
        .then((...results) => {
          this.getReduceEmitter().emit(actionName, actionName, ...results);
        })
        .catch((error) => {
          this.getReduceEmitter().emit($REDUCE_ERROR_EMIT_KEY, error, actionName, ...args);
        });
    } else {
      this.getReduceEmitter().emit(actionName, actionName, ...args);
    }
  }

  /**
   * Trigger event on action
   * @param {string} actionName Action name
   * @return {Core}
   */
  triggerAction(actionName, ...args) {
    let emitter = this.getActionEmitter();
    emitter.emit(actionName, actionName, ...args);
    return this;
  }

  /**
   * Add action(s).
   * @param {string|object} actionNameOrList Action name or action list.
   * @param {function|function[]|null|undefined} callbacks Array of callback functions or one function.
   * @return {Core}
   */
  addAction(actionNameOrList, ...callbacks) {
    if (_.isPlainObject(actionNameOrList)) {
      _.forEach(actionNameOrList, (callbacks, actionName) => {
        callbacks = _.castArray(callbacks);
        this.addActionInternal(actionName, ...callbacks);
      });
    } else {
      this.addActionInternal(actionNameOrList, ...callbacks);
    }
  }

  /**
   * Add action.
   * @param {string} actionName Action name.
   * @param {function|function[]} callbacks Array of callback functions or one function.
   * @return {Core}
   */
  addActionInternal(actionName, ...callbacks) {
    let actions = this.getAction(actionName);

    // check callback is function
    callbacks = _.flattenDeep(_.castArray(callbacks));
    let beforeCallbackLength = callbacks.length;
    callbacks = _.filter(callbacks, (callback) => { return _.isFunction(callback); });
    if (beforeCallbackLength !== callbacks.length) logger.warn("Callbacks accept only function");

    actions = actions.push(...callbacks);
    this.actionMap = this.actionMap.set(actionName, actions);

    return this;
  }

  /**
   * Return action callbacks by action name.
   * @param {string} actionName Action name
   * @return {function()}
   */
  getAction(actionName) {
    let actions = this.actionMap.get(actionName);
    if (!Immutable.List.isList(actions)) actions = Immutable.List();
    return actions;
  }

  /**
   * Return action map object.
   * @return {Immutable.Map}
   */
  getActionMap() {
    return this.actionMap;
  }

  /**
   * Return action event emitter.
   * @return {Emitter}
   */
  getActionEmitter() {
    return this.actionEmitter;
  }

  /**
   * Return reduce event emitter.
   * @return {Emitter}
   */
  getReduceEmitter() {
    return this.reduceEmitter;
  }
}

/**
 * @type {Core}
 */
let CoreInstance = new Core();

/**
 * Return Anthe.Core instance
 * @return {Core}
 */
function getCore() {
  return CoreInstance;
}

// exports
export default Core;
export { getCore };

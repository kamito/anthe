
import _ from 'lodash';
import Immutable from 'immutable';
import logger from './logger';

/**
 * Anthe.Core
 */
export class Core {

  /**
   * @constructor
   */
  constructor() {
    this.actionMap = Immutable.Map();
  }

  /**
   * Add action.
   * @param {string} actionName Action name.
   * @param {function|function[]} callbacks Array of callback functions or one function.
   * @return {Core}
   */
  addAction(actionName, ...callbacks) {
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
}

// Create Core instance.
let CoreInstance = new Core();

/**
 * Add action.
 * @param {string} actionName Action name.
 * @param {function} callbacks Array of callback functions or one function.
 * @return {Core}
 */
function action(...args) {
  return CoreInstance.addAction(args);
}

// exports
export default CoreInstance;

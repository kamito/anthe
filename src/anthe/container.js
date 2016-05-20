
import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';
import { getCore } from './core';
import logger from './logger';

/**
 * Anthe.Container
 * @class
 * @extends {React.Component}
 */
class Container extends React.Component {

  /**
   * @constructor
   * @param {object} props Initial props.
   */
  constructor(props={}) {
    super(props);

    /**
     * Anthe.Core instance.
     * @type {Anthe.Core}
     */
    this.antheCore_ = getCore();

    /**
     * Event Emitter for reduce actions.
     * @type {Anthe.Emitter}
     */
    this.emitter_ = this.antheCore_.getReduceEmitter();

    /**
     * Reducer Map.
     * @type {Immutable.Map}
     */
    this.reducerMap = Immutable.Map();

    /**
     * State.
     * @type {object}
     */
    this.state = this.initState(props);

    // Start suscribe for reducer.
    this.initSubscribe();
  }

  /**
   * Initialize State object.
   * @param {*} props Initial properties
   * @return {*}
   */
  initState(props) {
    return props;
  }

  /**
   * Initialize subscriber.
   * @interface
   */
  initSubscribe() {
    // interface
  }

  /**
   * Start subscribe.
   * @param {string} actionName Action name.
   * @param {function|function[]} reducers Reduce functons.
   * @return {Anthe.Container}
   */
  subscribe(actionName, ...reducers) {
    // check callback is function
    reducers = _.flattenDeep(_.castArray(reducers));
    let beforeReducersLength = reducers.length;
    reducers = _.filter(reducers, (reducer) => { return _.isFunction(reducer); });
    if (beforeReducersLength !== reducers.length) logger.warn("Reducer accept only function");

    // Set reducers
    let currentReducers = this.getReducers(actionName);
    reducers = currentReducers.push(...reducers);
    this.reducerMap = this.getReducerMap().set(actionName, reducers);

    // subscribe
    let emitter = this.getEmitter();
    emitter.off(actionName, this.onSubscribe.bind(this));
    emitter.on(actionName, this.onSubscribe.bind(this));

    return this;
  }

  /**
   * @see subscribe
   */
  on(...args) {
    this.subscribe(...args);
  }

  /**
   * Receive message.
   * @param {string} actionName Action name.
   * @param {...} results Results of action.
   */
  onSubscribe(actionName, ...results) {
    let reducers = this.getReducers(actionName);
    if (reducers.size > 0) {
      let prevState = Immutable.fromJS(this.state || {});
      Promise
        .all(_.map(reducers.toArray(), (callback) => {
          return new Promise((resolve, reject) => {
            try {
              let rets = callback(prevState, ...results);
              resolve(rets);
            } catch (err) {
              reject(err);
            };
          });
        }))
        .then((results) => {
          let newState = prevState;
          _.each(results, (result) => {
            result = (!Immutable.Map.isMap(result) && _.isObject(result)) ? Immutable.fromJS(result) : Immutable.Map();
            newState = newState.mergeDeep(result);
          });
          if (!Immutable.is(prevState, newState)) {
            this.setState(newState.toJS());
          }
        })
        .catch((error) => {
          this.onError(error, actionName, ...results);
        });
    }
  }

  onError(error, actionName, ...args) {

  }

  /**
   * Return reducer functions.
   * @param {string} actionName Action name.
   * @return {function[]}
   */
  getReducers(actionName) {
    let reducers = this.getReducerMap().get(actionName);
    if (!Immutable.List.isList(reducers)) reducers = Immutable.List();
    return reducers;
  }

  /**
   * Return reducer map object.
   * @return {Immutable.Map}
   */
  getReducerMap() {
    return this.reducerMap;
  }

  /**
   * Return Event emitter.
   * @return {Anthe.Emitter}
   */
  getEmitter() {
    return this.emitter_;
  }
}

// exports
export default Container;

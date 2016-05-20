
import Core, { getCore } from './anthe/core';
import Container from './anthe/container';

/**
 * @type {Core}
 */
let CoreInstance = getCore();


/**
 * Add action.
 * @param {...} args Call CoreInstance.addAction arguments
 * @return {Core}
 */
function action(...args) {
  return CoreInstance.addAction(...args);
}

/**
 * Trigger action.
 * @param {...} args Call CoreInstance.triggerAction arguments
 * @return {Core}
 */
function trigger(...args) {
  return CoreInstance.triggerAction(...args);
}


let Anthe = {
  Core: Core,
  Container: Container,
  getCore: getCore,
  action: action,
  trigger: trigger
};

export default Anthe;
export { Core, getCore, Container, action, trigger };

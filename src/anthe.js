
import Core from './anthe/core';

let CoreInstance = new Core();

/**
 * Return Anthe.Core instance
 * @return {Core}
 */
function getCore() {
  return CoreInstance;
}

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
  getCore: getCore,
  action: action,
  trigger: trigger
};

export default Anthe;
export { Core, getCore, action, trigger };

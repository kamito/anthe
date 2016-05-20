
import assert from 'power-assert';
import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import _ from 'lodash';
import Immutable from 'immutable';

import { Core, Container } from '../../src/anthe';
import * as coreFns from '../../src/anthe/core';
import Emitter from '../../src/anthe/emitter';
import { $REDUCE_ERROR_EMIT_KEY } from '../../src/anthe/const';



describe("Anthe.Container", () => {

  describe("#getEmitter", () => {
    it("return emitter", () => {
      class SampleComponent extends Container {
        render() { return (<div>Anthe</div>); }
      }
      const container = TestUtils.renderIntoDocument(<SampleComponent />);
      assert(container.getEmitter() instanceof Emitter === true);
    });
  });

  describe("#getReducerMap", () => {
    it("return emitter", () => {
      class SampleComponent extends Container {
        render() { return (<div>Anthe</div>); }
      }
      const container = TestUtils.renderIntoDocument(<SampleComponent />);
      assert(Immutable.Map.isMap(container.getReducerMap()) === true);
    });
  });

  describe("#subscribe, #on", () => {
    let core = null;
    let container = null;
    let stub = null;
    beforeEach(() => {
      core = new Core();
      stub = sinon.stub(coreFns, 'getCore', () => { return core; });
    });
    afterEach(() => {
      stub.restore();
    });

    describe("subscriber is one function", () => {
      it("added subscriber", () => {
        class SampleComponent extends Container {
          initSubscribe() {
            this.subscribe('myAction', () => {});
          }
          render() { return (<div>Anthe</div>); }
        }
        container = TestUtils.renderIntoDocument(<SampleComponent />);
        let resucers = container.getReducers('myAction');
        assert(Immutable.List.isList(resucers) === true);
        assert(resucers.size === 1);
      });
    });

    describe("subscriber is some functions array", () => {
      it("added subscribers", () => {
        class SampleComponent extends Container {
          initSubscribe() {
            this.subscribe('myAction', () => {}, () => {});
          }
          render() { return (<div>Anthe</div>); }
        }
        container = TestUtils.renderIntoDocument(<SampleComponent />);
        let resucers = container.getReducers('myAction');
        assert(Immutable.List.isList(resucers) === true);
        assert(resucers.size === 2);
      });
    });

    describe("actionName is subscriber map", () => {
      it("added subscribers", () => {
        class SampleComponent extends Container {
          initSubscribe() {
            let subscribers = { myAction: [() => {}, () => {}] };
            this.subscribe(subscribers);
          }
          render() { return (<div>Anthe</div>); }
        }
        container = TestUtils.renderIntoDocument(<SampleComponent />);
        let resucers = container.getReducers('myAction');
        assert(Immutable.List.isList(resucers) === true);
        assert(resucers.size === 2);
      });

      it("added subscribers", () => {
        class SampleComponent extends Container {
          initSubscribe() {
            let subscribers = {
              myAction1: () => {},
              myAction2: () => {}
            };
            this.subscribe(subscribers);
          }
          render() { return (<div>Anthe</div>); }
        }
        container = TestUtils.renderIntoDocument(<SampleComponent />);
        let resucers = container.getReducers('myAction1');
        assert(Immutable.List.isList(resucers) === true);
        assert(resucers.size === 1);
      });
    });

    it("execute subscribe method", (done) => {
      let doneCalled = false;
      class SampleComponent extends Container {
        initSubscribe() {
          this.subscribe('myAction', (state, arg1) => {
            assert(arg1 === "test");
            return { test1: 'test1' };
          });
          this.subscribe('myAction', (state, arg1) => {
            assert(arg1 === "test");
            return { test2: 'test2' };
          });
        }
        componentWillUpdate(nextProps, nextState) {
          assert(nextState.test1 === 'test1');
          assert(nextState.test2 === 'test2');
          if (!doneCalled) {
            done();
            doneCalled = true;
          }
        }
        render() { return (<div>Anthe</div>); }
      }
      container = TestUtils.renderIntoDocument(<SampleComponent />);
      core.triggerAction("myAction", "test");
    });
  });

});

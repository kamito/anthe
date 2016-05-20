
import assert from 'power-assert';
import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import _ from 'lodash';
import Immutable from 'immutable';

import { Core, getCore } from '../../src/anthe';
import { $REDUCE_ERROR_EMIT_KEY } from '../../src/anthe/const';


describe("Anthe.Core", () => {

  it("is `Anthe.Core` Instance", () => {
    let CoreInstance = getCore();
    assert(CoreInstance instanceof Core === true);
  });

  describe("#getActionMap", () => {
    it("return Immutable.Map object", () => {
      let core = new Core();
      let ret = core.getActionMap();
      assert(Immutable.Map.isMap(ret) === true);
      assert(ret.size === 0);
    });
  });

  describe("#addAction", () => {
    describe("callback is only function", () => {
      let core = null;
      beforeEach(() => {
        core = new Core();
      });

      it("added one callback", () => {
        core.addAction('myspec', () => {});
        let ret = core.getActionMap();
        assert(Immutable.Map.isMap(ret) === true);
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 1);
      });

      it("added some callbacks", () => {
        core.addAction('myspec', () => {}, () => {}, () => {});
        let ret = core.getActionMap();
        assert(Immutable.Map.isMap(ret) === true);
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 3);
      });

      it("added some callbacks in array", () => {
        core.addAction('myspec', [() => {}, () => {}, () => {}]);
        let ret = core.getActionMap();
        assert(Immutable.Map.isMap(ret) === true);
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 3);
      });
    });

    describe("callback is not only function", () => {
      let core = null;
      beforeEach(() => {
        core = new Core();
      });

      it("not added one callback with null", () => {
        core.addAction('myAction', null);
        let ret = core.getActionMap();
        assert(ret.size === 1);
        assert(ret.get('myAction').size === 0);
      });

      it("not added one callback with undefined", () => {
        core.addAction('myAction', undefined);
        let ret = core.getActionMap();
        assert(ret.size === 1);
        assert(ret.get('myAction').size === 0);
      });

      it("not added one callback with number", () => {
        core.addAction('myAction', 100);
        let ret = core.getActionMap();
        assert(ret.size === 1);
        assert(ret.get('myAction').size === 0);
      });

      it("not added one callback with string", () => {
        core.addAction('myAction', "invalid");
        let ret = core.getActionMap();
        assert(ret.size === 1);
        assert(ret.get('myAction').size === 0);
      });

      it("added some callbacks with null", () => {
        core.addAction('myAction', () => {}, null, () => {});
        let ret = core.getActionMap();
        assert(ret.size === 1);
        assert(ret.get('myAction').size === 2);
      });

      it("added some callbacks with null in array", () => {
        core.addAction('myAction', [() => {}, null, () => {}]);
        let ret = core.getActionMap();
        assert(Immutable.Map.isMap(ret) === true);
        assert(ret.size === 1);
        assert(ret.get('myAction').size === 2);
      });
    });

    describe("actionName is object", () => {
      let core = null;
      beforeEach(() => {
        core = new Core();
      });

      it("added one callback", () => {
        let actionMap = { myspec: () => {} };
        core.addAction(actionMap);
        let ret = core.getActionMap();
        assert(Immutable.Map.isMap(ret) === true);
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 1);
      });

      it("added some callbacks", () => {
        let actionMap = { myspec: [() => {}, () => {}, () => {}] };
        core.addAction(actionMap);
        let ret = core.getActionMap();
        assert(Immutable.Map.isMap(ret) === true);
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 3);
      });

      it("added some callbacks in array", () => {
        let actionMap = { myspec: [() => {}, () => {}, () => {}] };
        core.addAction(actionMap);
        let ret = core.getActionMap();
        assert(Immutable.Map.isMap(ret) === true);
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 3);
      });
    });

  });

  describe("#getAction", () => {
    let core = null;
    beforeEach(() => {
      core = new Core();
    });

    it("return one callback", () => {
      core.addAction('myAction', () => {});
      let ret = core.getAction('myAction');
      assert(Immutable.List.isList(ret) === true);
      assert(ret.size === 1);
    });

    it("return some callback", () => {
      core.addAction('myAction', () => {}, () => {});
      let ret = core.getAction('myAction');
      assert(Immutable.List.isList(ret) === true);
      assert(ret.size === 2);
    });
  });

  describe("#triggerAction", () => {
    let core = null;
    beforeEach(() => {
      core = new Core();
      core.addAction('myAction', () => {});
    });

    it("execute callback functions", (done) => {
      let emitter = core.getActionEmitter();
      emitter.on('myAction', (actionName, arg1) => {
        assert(actionName === 'myAction');
        assert(arg1 === "test");
        done();
      });
      core.triggerAction("myAction", "test");
    });
  });

  describe("#onAction", () => {
    let core = null;
    beforeEach(() => {
      core = new Core();
    });

    it("execute callback functions", (done) => {
      core.addAction('myAction', (arg1, arg2) => {
        assert(arg1 === "test1");
        assert(arg2 === "test2");
        done();
        return true;
      });
      core.triggerAction("myAction", "test1", "test2");
    });

    it("call reduce function", (done) => {
      core.addAction('myAction', (arg1, arg2) => {
        assert(arg1 === "test1");
        assert(arg2 === "test2");
        return "result";
      });

      let reduceEmitter = core.getReduceEmitter();
      reduceEmitter.on('myAction', (actionName, res1) => {
        assert(actionName === 'myAction');
        assert.deepEqual(res1, ["result"]);
        done();
        return true;
      });

      core.triggerAction("myAction", "test1", "test2");
    });

    it("call with Promise function", (done) => {
      core.addAction('myAction', (arg1, arg2) => {
        return new Promise((resolve, reject) => {
          window.setTimeout(() => {
            assert(arg1 === "test1");
            assert(arg2 === "test2");
            resolve("result");
          }, 500);
        });
      });

      let reduceEmitter = core.getReduceEmitter();
      reduceEmitter.on('myAction', (actionName, res1) => {
        assert(actionName === 'myAction');
        assert.deepEqual(res1, ["result"]);
        done();
        return true;
      });

      core.triggerAction("myAction", "test1", "test2");
    });

    describe("raise error in action", () => {
      it("call reduce error function", (done) => {
        core.addAction('myAction', (arg1, arg2) => {
          assert(arg1 === "test1");
          assert(arg2 === "test2");
          throw new Error("error");
        });

        let reduceEmitter = core.getReduceEmitter();
        reduceEmitter.on($REDUCE_ERROR_EMIT_KEY, (error, actionName, arg1, arg2) => {
          assert(error.message === "error");
          assert(actionName === "myAction");
          assert(arg1 === "test1");
          assert(arg2 === "test2");
          done();
          return true;
        });

        core.triggerAction("myAction", "test1", "test2");
      });
    });
  });

});

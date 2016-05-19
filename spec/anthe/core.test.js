
import assert from 'power-assert';
import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import _ from 'lodash';
import Immutable from 'immutable';

import CoreInstance, { Core } from '../../src/anthe/core';

describe("Anthe.Core", () => {

  it("is `Anthe.Core` Instance", () => {
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
        core.addAction('myspec', null);
        let ret = core.getActionMap();
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 0);
      });

      it("not added one callback with undefined", () => {
        core.addAction('myspec', undefined);
        let ret = core.getActionMap();
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 0);
      });

      it("not added one callback with number", () => {
        core.addAction('myspec', 100);
        let ret = core.getActionMap();
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 0);
      });

      it("not added one callback with string", () => {
        core.addAction('myspec', "invalid");
        let ret = core.getActionMap();
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 0);
      });

      it("added some callbacks with null", () => {
        core.addAction('myspec', () => {}, null, () => {});
        let ret = core.getActionMap();
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 2);
      });

      it("added some callbacks with null in array", () => {
        core.addAction('myspec', [() => {}, null, () => {}]);
        let ret = core.getActionMap();
        assert(Immutable.Map.isMap(ret) === true);
        assert(ret.size === 1);
        assert(ret.get('myspec').size === 2);
      });
    });
  });

  describe("#getAction", () => {
    let core = null;
    beforeEach(() => {
      core = new Core();
    });

    it("return one callback", () => {
      core.addAction('myspec', () => {});
      let ret = core.getAction('myspec');
      assert(Immutable.List.isList(ret) === true);
      assert(ret.size === 1);
    });

    it("return some callback", () => {
      core.addAction('myspec', () => {}, () => {});
      let ret = core.getAction('myspec');
      assert(Immutable.List.isList(ret) === true);
      assert(ret.size === 2);
    });
  });

});

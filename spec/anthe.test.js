
import assert from 'power-assert';
import { describe, it, before } from 'mocha';
import _ from 'lodash';

import Anthe from '../src/anthe';

describe("Anthe", () => {

  it("is Object", () => {
    assert(_.isObject(Anthe) === true);
  });

});

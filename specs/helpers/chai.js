/**
 * Created by jeannie.boffel on 2/15/2016.
 */

var chai = require('chai');

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
const { HelloNapi, ObjectWrapDemo } = require("../lib/binding.js");
const assert = require("assert");

assert(HelloNapi, "The expected function HelloNapi is undefined");
assert(ObjectWrapDemo, "The expected function ObjectWrapDemo is undefined");

function testHelloNapi()
{
    const result = HelloNapi("hello");
    assert.strictEqual(result, "world", "Unexpected value returned");
}

function testObjectWrapDemo()
{
    const instance = new ObjectWrapDemo("mr-yeoman");
    assert(instance.greet, "The expected method is not defined");
    assert.strictEqual(instance.greet("kermit"), "mr-yeoman", "Unexpected value returned");
}

function testInvalidParams()
{
    const instance = new ObjectWrapDemo();
}

assert.doesNotThrow(testHelloNapi, undefined, "testHelloNapi threw an expection");
assert.doesNotThrow(testObjectWrapDemo, undefined, "testObjectWrapDemo threw an expection");
assert.throws(testInvalidParams, undefined, "testInvalidParams didn't throw");

console.log("Tests passed- everything looks OK!");
// const helloNapi = require('../build/Release/hello-napi-native');
// const objectWrapDemo = require('../build/Release/object-wrap-demo');
var helloNapi = require('bindings')('hello-napi-native')
var objectWrapDemo  = require('bindings')('object-wrap-demo')

function ObjectWrapDemo(name) {
    var _addonInstance = new objectWrapDemo.ObjectWrapDemo(name);
    this.greet = (str) => _addonInstance.greet(str);
    this.info = () => _addonInstance.info();
}

module.exports = {
  "HelloNapi": helloNapi.HelloNapi,
  "ObjectWrapDemo": ObjectWrapDemo,
};
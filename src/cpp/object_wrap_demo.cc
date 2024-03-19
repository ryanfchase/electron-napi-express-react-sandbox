#include "object_wrap_demo.h"
#include <sstream>
#include <iostream>

#if defined(__linux__)
  #define OS_NAME "Linux"
#elif defined(__APPLE__)
  #define OS_NAME "macOS"
#elif defined(_WIN32) || defined(_WIN64)
  #define OS_NAME "Windows"
#else
  #define OS_NAME "Unknown"
#endif


using namespace Napi;

// Constructor - expects the name of the greeter, storing it as a member variable
ObjectWrapDemo::ObjectWrapDemo(const Napi::CallbackInfo& info) : ObjectWrap(info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
    return;
  }

  if (!info[0].IsString()) {
    Napi::TypeError::New(env, "You need to name yourself")
        .ThrowAsJavaScriptException();
    return;
  }

  this->_greeterName = info[0].As<Napi::String>().Utf8Value();
}

Napi::Value ObjectWrapDemo::Greet(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[0].IsString()) {
    Napi::TypeError::New(env, "You need to introduce yourself to greet")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  Napi::String name = info[0].As<Napi::String>();

  std::stringstream ss;
  ss << "Hello " << name.Utf8Value() << ", " << this -> _greeterName << " says nice to meet you!" << std::endl;

  return Napi::String::New(env, ss.str());
}

Napi::Value ObjectWrapDemo::GetInfo(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 0) {
    Napi::TypeError::New(env, "Wrong number of arguments")
      .ThrowAsJavaScriptException();
    return env.Null();
  }

  std::stringstream ss;
  ss << "I am " << this -> _greeterName << ", an N-API server running on the " << OS_NAME << " operating system." << std::endl;
  return Napi::String::New(env, ss.str());
}

// defines the ObjectWrapDemo class for use in javascript
// - registers the `greet` method as an instance method of the class
// - registers the `info` method as an instance method of the class
Napi::Function ObjectWrapDemo::GetClass(Napi::Env env) {
  return DefineClass(
      env,
      "ObjectWrapDemo",
      {
        ObjectWrapDemo::InstanceMethod("greet", &ObjectWrapDemo::Greet),
        ObjectWrapDemo::InstanceMethod("info", &ObjectWrapDemo::GetInfo),
      });
}

// - called when the Node.js addon is loaded.
// - creates a javascript object named "ObjectWrapDemo" and sets it to the result of calling
//    `ObjectWrapDemo::GetClass(env)
// - it returns this object to make it available for use in Javascript
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  Napi::String name = Napi::String::New(env, "ObjectWrapDemo");
  exports.Set(name, ObjectWrapDemo::GetClass(env));
  return exports;
}

NODE_API_MODULE(addon, Init)
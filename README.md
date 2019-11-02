# sourcetrail-db

Node.js Library to export Sourcetrail compatible database files for writing custom indexers

## Building

This is an N-API addon built using [CMake.js](https://github.com/cmake-js/cmake-js#readme) instead of node-gyp.

The project assumes both CMake and CMake.js have been installed globally. First [Install CMake](https://cmake.org/download/) then:

```
npm install -g cmake-js
cmake-js --help
```

If so, the following commands build and test the addon:

```
npm install
npm test
```

Complete CMake.js documentation can be found on the [CMake.js GitHub repository](https://github.com/cmake-js/cmake-js#readme).

### NAPI_VERSION

When building N-API addons, it's important to specify to the build system the N-API version your code is designed to work with. With CMake.js, this information is specified in the `CMakeLists.txt` file:

```
add_definitions(-DNAPI_VERSION=3)
```

Since N-API is ABI-stable, your N-API addon will work, without recompilation, with the N-API version you specify in `NAPI_VERSION` and all subsequent N-API versions.

In the absence of a need for features available only in a specific N-API version, version 3 is a good choice as it is the version of N-API that was active when N-API left experimental status.

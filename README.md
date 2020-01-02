# object-rollback

<!-- [![Go to the latest release page on npm](https://img.shields.io/npm/v/object-rollback.svg)](https://www.npmjs.com/package/object-rollback) -->
[![License: MIT](https://img.shields.io/static/v1?label=license&message=MIT&color=green)](https://github.com/sounisi5011/object-rollback/blob/v1.0.0/LICENSE)
![Supported Node.js version: >=8.3.0](https://img.shields.io/static/v1?label=node&message=%3E%3D8.3.0&color=brightgreen)
![Type Definitions: TypeScript](https://img.shields.io/static/v1?label=types&message=TypeScript&color=blue)
<!-- [![install size](https://packagephobia.now.sh/badge?p=object-rollback@1.0.0)](https://packagephobia.now.sh/result?p=object-rollback@1.0.0) -->
[![Dependencies Status](https://david-dm.org/sounisi5011/object-rollback/status.svg)](https://david-dm.org/sounisi5011/object-rollback)
[![Build Status](https://dev.azure.com/sounisi5011/npm%20projects/_apis/build/status/sounisi5011.object-rollback?branchName=master)](https://dev.azure.com/sounisi5011/npm%20projects/_build/latest?definitionId=6&branchName=master)
[![Maintainability Status](https://api.codeclimate.com/v1/badges/12a68b5e4ba161dbd457/maintainability)](https://codeclimate.com/github/sounisi5011/object-rollback/maintainability)

Cancel changes to JavaScript object values (add/update/delete properties, add item into [Map]/[Set], etc.)

[Map]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map
[Set]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set

## Install

```sh
npm install object-rollback
```

## Usage

```js
const { ObjectState } = require('object-rollback');

const someValue = {
  a: 1,
  b: 2,
  c: [ 1, 2, 3 ],
};

console.log(someValue); // { a: 1, b: 2, c: [ 1, 2, 3 ] }

const state = new ObjectState(someValue);

someValue.b = 200;
someValue.x = 42;
someValue.c.push(9);

console.log(someValue); // { a: 1, b: 200, c: [ 1, 2, 3, 9 ], x: 42 }

state.rollback();

console.log(someValue); // { a: 1, b: 2, c: [ 1, 2, 3 ] }
```

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```sh
npm install
npm test
```

## Contributing

see [CONTRIBUTING.md](https://github.com/sounisi5011/object-rollback/blob/master/CONTRIBUTING.md)

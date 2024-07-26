'use strict';

const createBuzzsApp = require('..');
const assert = require('assert').strict;

assert.strictEqual(createBuzzsApp(), 'Hello from createBuzzsApp');
console.info('createBuzzsApp tests passed');

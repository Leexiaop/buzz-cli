#!/usr/bin/env node
const spawn = require('cross-spawn');
const childOutput = spawn.sync('npm', ['config', 'list']).output.join('');
console.log(childOutput);

#!/usr/bin/env node

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];

if (major < 14) {
    console.error(`Your node version is ${major}, Create Buzzs App requires Node 14 or heigher, please update your version of Node.`);
    process.exist(1)
};

const { init } = require('./create-buzzs-app');

init();
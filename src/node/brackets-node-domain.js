/*eslint no-console:0,no-undefined:0,no-process-env:0*/
(function () {
  'use strict';

  const domainName = 'brackets-npm-registry-domain';
  const buffspawn = require('buffered-spawn');
  const nodeEnsure = require('./node-ensure');
  let domainManager = null;

  const buildRegistry = function (callback, progressCallback) {
    nodeEnsure().then(nodePath => {

      let args = ['registry-builder.js'];

      return buffspawn(nodePath, args, {
        cwd: __dirname
      }).progress(function (buff) {
        if (progressCallback && buff.type === 'stderr') {
          progressCallback(buff.toString());
        }
      }).spread(function (stdout) {
        callback(undefined, stdout);
      });

    }).catch(err => callback(err));
  };

  const installExtension = function (targetPath, name, callback, progressCallback) {
    nodeEnsure().then(nodePath => {

      let args = ['extension-installer.js', targetPath, name];

      return buffspawn(nodePath, args, {
        cwd: __dirname
      }).progress(function (buff) {
        if (progressCallback && buff.type === 'stderr') {
          progressCallback(buff.toString());
        }
      }).spread(function (stdout, stderr) {
        callback(undefined, progressCallback ? stdout : [stderr, stdout].join('\n'));
      });

    }).catch(err => callback(err));
  };

  exports.init = function (_domainManager) {
    domainManager = _domainManager;

    if (!domainManager.hasDomain(domainName)) {
      domainManager.registerDomain(domainName, {major: 0, minor: 1});
    }

    domainManager.registerCommand(
      domainName,
      'buildRegistry', // command name
      buildRegistry, // handler function
      true, // is async
      'get a list of extensions from npm', // description
      [
        {name: 'extensions', type: 'array'}
      ]
    );

    domainManager.registerCommand(
      domainName,
      'installExtension',
      installExtension,
      true,
      'installs an extension into a given path',
      [
        {name: 'targetPath', type: 'string'},
        {name: 'extensionName', type: 'string'},
        {name: 'installLog', type: 'string'}
      ]
    );

  };

}());

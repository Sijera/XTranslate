'use strict';

/**
 * A trivial implementation of CommonJS pattern
 * To be used in development mode *only*!
 *
 * @public
 * @param {string} path
 * @return {*}
 */
var require = function (path) {
    var modulePath = require.modulePath;
    var filePath = path.split('/');
    var fileName = filePath.slice(-1)[0];

    if (filePath[0] == '.') filePath.shift();
    if (!/\.js$/i.test(fileName)) filePath.splice(-1, 1, (fileName += '.js'));

    // clean up from parent directory notation
    filePath = modulePath.concat(filePath.slice(0, -1));
    var i; while ((i = filePath.indexOf('..')) > -1) filePath.splice(i - 1, 2);
    require.modulePath = filePath;

    // load module with blocking (like <script> tags)
    var fileUrl = require.moduleRoot + filePath.concat(fileName).join('/');
    var module = require.modules[fileUrl];
    if (!module) {
        if (require.debug) console.info('Start loading: ', fileUrl);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', fileUrl + require.noCacheQuery, false);
        xhr.send();

        // because it is synchronous loading we don't use callbacks
        // status - 0, for files loaded locally (i.e. cordova, etc.)
        var source = xhr.responseText;
        var status = xhr.status;
        if (status === 200 || status === 0) {
            module = {exports: {}};
            try {
                // fix for firebug - if put the string directly in eval() -> sourceURL doesn't work
                var evilCode_lol = '(function (module, exports) { ' + source + '})(module, module.exports);\n\n//@ sourceURL=' + fileUrl;
                eval(evilCode_lol);
            } catch (e) {
                console.error('Error within file ' + fileUrl + ': ', e['stack']);
            }

            // cache loaded module
            require.modules[fileUrl] = module;
        }
    }

    require.modulePath = modulePath;
    return module.exports;
};

/**
 * URL-path to folder with JS modules.
 * By default, it has the same path where located require.js (this file)
 * @type {String}
 */
require.moduleRoot = function () {
    var url = Array.prototype.slice.call(document.querySelectorAll('script'), -1)[0].src;
    return url.substr(0, url.lastIndexOf('/') + 1);
}();

/**
 * Actual path to the module inside itself (relative to the module root)
 * @type {Array}
 */
require.modulePath = [];

/**
 * A hash object with loaded modules
 * @type {Object}
 */
require.modules = {};

require.debug = false;
require.noCacheQuery = '?'+ Date.now();
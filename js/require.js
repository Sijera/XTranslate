'use strict';

/**
 * A trivial implementation of CommonJS pattern
 * To be used in development mode *only*!
 * @public
 */
var require = function (pathRel) {
    var modulePath = require.modulePath;
    var filePath = (pathRel || require.entryFile).split('/');
    var fileName = filePath.slice(-1)[0];

    if (filePath[0] == '.') filePath.shift();
    if (!/\.js$/i.test(fileName)) filePath.splice(-1, 1, (fileName += '.js'));

    // clean up from parent directory notation
    filePath = modulePath.concat(filePath.slice(0, -1));
    var i; while ((i = filePath.indexOf('..')) > -1) filePath.splice(i - 1, 2);
    require.modulePath = filePath;

    // load module with blocking
    var fileUrl = require.moduleRoot + filePath.concat(fileName).join('/');
    var module = require.modules[fileUrl];
    if (!module) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', fileUrl + require.noCacheQuery, false);
        xhr.send();

        var source = xhr.responseText,
            status = xhr.status, // 0, for files loaded locally (i.e. cordova, etc.)
            script = '(function (module, exports, global) {' + source + '\n})(module, module.exports, window);\n\n//@ sourceURL=' + fileUrl;
        if (status === 200 || status === 0) {
            try {
                module = {exports: {}};
                eval(script);
                require.modules[fileUrl] = module;
            } catch (error) {
                console.error('Error in file "' + fileName + '":', error.stack);
            }
        }
    }

    require.modulePath = modulePath;
    return module.exports;
};

require.moduleRoot = function () {
    var script = Array.prototype.slice.call(document.querySelectorAll('script'), -1)[0];
    if (!script) return '';
    var requirePath = script.src.substr(0, script.src.lastIndexOf('/') + 1);
    require.entryFile = script.getAttribute('data-entry');
    return requirePath;
}();

require.modulePath = [];
require.modules = {};
require.noCacheQuery = '?'+ Date.now();
require.location = location.href;

if (require.entryFile) require();
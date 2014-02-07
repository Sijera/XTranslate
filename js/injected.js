'use strict';

/**
 * XTranslate - injected script on website page
 * @url https://github.com/ixrock/XTranslate
 */
require.moduleRoot = chrome.runtime.getURL('js/');

// load modules
var toCSS = require('./theme').toCSS,
    Popup = require('./views/popup').Popup,
    Chrome = require('./extension/chrome').Chrome;

// run
//new Chrome().getBackgroundPage(function (bgcPage) {
//    console.info(bgcPage);
//});

chrome.runtime.onConnect.addListener(function (port) {
    console.info(port, chrome.runtime.getBackgroundPage);
});
'use strict';

var APP = require('./app').create({autoSync: false}),
    Popup = require('./views/popup').Popup,
    THEME = require('./theme');

// Listen events from the options page
APP.extension.onMessage(function (msg) {
    if (msg.type == 'modelChange') APP.set(msg.chain, msg.value);
});

// Run content script
APP.on('ready', function () {

});
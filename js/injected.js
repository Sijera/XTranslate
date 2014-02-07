'use strict';

/**
 * XTranslate - injected content script (entry point)
 * @url https://github.com/ixrock/XTranslate
 */
require.moduleRoot = chrome.runtime.getURL('js/');
require('./user_script');
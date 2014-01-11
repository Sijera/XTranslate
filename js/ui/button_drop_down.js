'use strict';

var inherit = require('../utils').inherit,
    Button = require('./button').Button,
    FlyingPanel = require('./flying_panel').FlyingPanel;

/** @const */ var POSITIONS = [{right: 0, top: '100%'}, {right: 0, bottom: '100%'}];
/** @const */ var IS_SEPARATED = 'separated';
/** @const */ var IS_ACTIVE = 'active';

/**
 * @constructor
 * @param {{separated: Boolean=, content: (String|HTMLElement|jQuery)=, dropDownClass: String=}} options
 */
var ButtonDropDown = function (options) {
    options = $.extend({separated: true, noBodyAppend: false, nodeType: 'div'}, options);

    this.separated = !!options.separated;
    this.noBodyAppend = !!options.noBodyAppend;
    this.dropDownClass = options.dropDownClass || '';

    ButtonDropDown.superclass.constructor.call(this, options);
    this.setContent(options.content);
};

inherit(ButtonDropDown, Button);

/** @protected */
ButtonDropDown.prototype.createDom = function () {
    ButtonDropDown.superclass.createDom.apply(this, arguments);

    this.$container
        .addClass('buttonDropDown')
        .toggleClass(IS_SEPARATED, this.separated);

    this.dropDownPanel = new FlyingPanel({
        positions   : POSITIONS,
        className   : 'buttonDropDownContent ' + (this.dropDownClass || ''),
        anchor      : this.$container,
        noBodyAppend: this.noBodyAppend,
        autoHide    : true
    });

    this.$content = this.dropDownPanel.$container;
    this.$arrowBtn = $('<span class="arrow"/>').appendTo(this.$container);
    this.$textBlock = $('<button class="text"/>').appendTo(this.$container);

    $(window).on('resize', this.onResize.bind(this));
    this.dropDownPanel.on('show hide', this.onShowHidePanel.bind(this));
};

/**
 * Set a content for drop down panel
 * @param {HTMLElement|jQuery|Array|String} content
 * @param {Boolean} [keepOld] Don't remove previous content, just add to the end
 */
ButtonDropDown.prototype.setContent = function (content, keepOld) {
    if (!content) return this;
    if (!keepOld) this.$content.empty();
    this.$content.append(content);
    return this;
};

/** @private */
ButtonDropDown.prototype.onShowHidePanel = function () {
    this.$container.toggleClass(IS_ACTIVE, !this.dropDownPanel.hidden);
};

/** @private */
ButtonDropDown.prototype.onResize = function () {
    if (this.dropDownPanel.hidden || this.noBodyAppend) return;
    this.dropDownPanel.update();
};

/** @protected */
ButtonDropDown.prototype.onClick = function (e) {
    if (this.separated) {
        if (this.$textBlock.is(e.target)) ButtonDropDown.superclass.onClick.apply(this, arguments);
        if (this.$arrowBtn.is(e.target)) this.togglePanel();
    }
    else {
        ButtonDropDown.superclass.onClick.apply(this, arguments);
        this.togglePanel();
    }
};

/** @protected */
ButtonDropDown.prototype.togglePanel = function () {
    this.dropDownPanel.toggle(this.dropDownPanel.hidden);
    this.dropDownPanel.update();
};

exports.ButtonDropDown = ButtonDropDown;

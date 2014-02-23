'use strict';

var inherit = require('../utils').inherit,
    sprintf = require('../utils').sprintf,
    UIComponent = require('../ui/ui_component').UIComponent;

/** @const */ var STORE_URL = 'https://chrome.google.com/webstore/detail/gfgpkepllngchpmcippidfhmbhlljhoo';
/** @const */ var REVIEW_URL = STORE_URL + '/reviews';
/** @const */ var DONATE_URL = 'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=NDM8RZ6PG5G6S&lc=US&item_name=XTranslate%20%28browser%20extension%29&item_number=2014&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted';

/**
 * @constructor
 */
var AppFooterBar = function (options) {
    AppFooterBar.superclass.constructor.call(this, options);
    this.$container.addClass('appFooterBar');

    var pkgInfo = APP.extension.getInfo();
    this.shareText = encodeURIComponent(pkgInfo.name + ' - ' + pkgInfo.description);

    this.$container.append('<p>' + __(60) + '</p>');
    this.$container.append(this.parseLinks(__(61, [REVIEW_URL, DONATE_URL])));
    this.$container.append(this.getSocialIcons());
    this.$container.append(__(62));
};

inherit(AppFooterBar, UIComponent);

/** @private */
AppFooterBar.prototype.parseLinks = function (text) {
    return text.replace(/\[.*?\]/g, function (S) {
        var data = JSON.parse(S.replace(/'/g, '"')),
            url = data[0],
            text = data[1];
        return '<a href="' + url + '" target="_blank">' + text + '</a>';
    });
};

/** @private */
AppFooterBar.prototype.getSocialIcons = function () {
    var $shareLinks = $('<span class="shareLinks"/>');
    this.socialIcons.map(function (data) {
        var url = sprintf(data.shareUrl, STORE_URL, this.shareText);
        $('<a class="share"/>')
            .addClass(data.className)
            .attr('href', url)
            .attr('title', data.title)
            .on('click', this.onClickShare.bind(this, url))
            .appendTo($shareLinks);
    }, this);
    return $shareLinks;
};

/** @private */
AppFooterBar.prototype.onClickShare = function (url) {
    window.open(url, "share_the_app", "width=550,height=300,resizable=1");
    return false;
};

/** @private */
AppFooterBar.prototype.socialIcons = [
    {
        title: 'Facebook',
        className: 'fb',
        shareUrl: 'https://www.facebook.com/sharer/sharer.php?u={0}'
    },
    {
        title: 'Vkontakte',
        className: 'vk',
        shareUrl: 'http://vkontakte.ru/share.php?url={0}'
    },
    {
        title: 'Twitter',
        className: 'tw',
        shareUrl: 'https://twitter.com/intent/tweet?source=webclient&url={0}&text={1}'
    },
    {
        title: 'Google+',
        className: 'gp',
        shareUrl: 'https://plus.google.com/share?url={0}'
    }
];

exports.AppFooterBar = AppFooterBar;
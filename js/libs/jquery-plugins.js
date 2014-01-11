/**
 * jQuery plugins/fixes/extensions used in the application
 */

// Transparent work-around for mousewheel-event in Firefox
// Docs: http://learn.jquery.com/events/event-extensions/
$.extend($.event.special, {
    DOMMouseScroll: {
        bindType: 'DOMMouseScroll',
        handle: function (e) {
            var delta = -e.originalEvent.detail;
            e.type = 'mousewheel';
            e.wheelDelta = delta / Math.abs(delta);
            e.handleObj.handler.apply(this, arguments);
        }
    },

    mousewheel: {
        bindType: 'mousewheel',
        /** @this HTMLElement */
        add: function (handleObj) {
            if(this.onmousewheel === undefined) {
                $(this).on('DOMMouseScroll', handleObj.data, handleObj.handler);
            }
        },
        /** @this HTMLElement */
        remove: function (handleObj) {
            if(this.onmousewheel === undefined) {
                $(this).off('DOMMouseScroll', handleObj.handler);
            }
        },
        handle: function (e) {
            var delta = e.originalEvent.wheelDelta;
            e.wheelDelta = delta / Math.abs(delta);
            e.handleObj.handler.apply(this, arguments);
        }
    }
});
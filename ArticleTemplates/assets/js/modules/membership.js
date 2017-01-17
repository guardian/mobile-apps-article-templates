define(function () {
    'use strict';

    var initialised;
    var trackMembershipCreativeView = true;

    function init() {
        if (!initialised) {
            initialised = true;

            window.injectInlineArticleMembershipCreative = injectInlineArticleMembershipCreative;
            window.applyNativeFunctionCall('injectInlineArticleMembershipCreative');

            GU.util.signalDevice('membership_creative_ready');
        }
    }

    function injectInlineArticleMembershipCreative(html, css, id) {
        var style,
            membershipCreativeContainer,
            insertBeforeElem;

        if (GU.util.isOnline() &&
            !document.getElementsByClassName('membership-creative-container').length) {

            insertBeforeElem = getInsertBeforeElem();

            if (insertBeforeElem) {
                //inject css
                style = document.createElement('style');
                style.type = 'text/css';
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }
                document.head.appendChild(style);

                // inject html
                membershipCreativeContainer = document.createElement('a');
                membershipCreativeContainer.href = 'x-gu://membership_creative_tap/' + id;
                membershipCreativeContainer.classList.add('membership-creative-container');
                membershipCreativeContainer.innerHTML = html;
                insertBeforeElem.parentNode.insertBefore(membershipCreativeContainer, insertBeforeElem);

                // on scroll check if creative is in viewport
                window.addEventListener('scroll', GU.util.debounce(isMembershipCreativeInView.bind(null, membershipCreativeContainer, id), 100));
            }
        }
    }

    function isMembershipCreativeInView(membershipCreative, id) {
        var messageName = 'membership_creative_view/' + id;

        if (trackMembershipCreativeView &&
            GU.util.isElementPartiallyInViewport(membershipCreative)) {
            GU.util.signalDevice(messageName);
            trackMembershipCreativeView = false;
        }
    }

    function getInsertBeforeElem() {
        var i,
            paraCount = 0,
            parentElem = document.querySelector('.article__body > div.prose');

        for (i = 0; i < parentElem.children.length; i++) {
            if (parentElem.children[i].tagName === 'P') {
                if (paraCount === 0 ||
                    ((parentElem.children[i - 1] && parentElem.children[i - 1].tagName === 'P') &&
                        (parentElem.children[i + 1] && (parentElem.children[i + 1].tagName === 'P' || parentElem.children[i + 1].tagName === 'H2')))) {

                    paraCount++;

                    if (paraCount > 4) {
                        // return fifth paragraph 
                        // which is preceded by a paragraph
                        // and followed by a paragraph or header
                        return parentElem.children[i];
                    }
                }
            }
        }

        return false;
    }

    return {
        init: init
    };
});
/*global window,document,console,define */
define(function () {
    'use strict';

    var MembershipCreative = Class.extend({
        init: function() {
            this.trackMembershipCreativeView = true;

            window.injectInlineArticleMembershipCreative = this.injectInlineArticleMembershipCreative.bind(this);
            window.applyNativeFunctionCall('injectInlineArticleMembershipCreative');

            GU.util.signalDevice('membership_creative_ready');
        },

        injectInlineArticleMembershipCreative: function(html, css, id) {
            var style,
                membershipCreativeContainer,
                insertBeforeElem;

            if (GU.util.isOnline() &&
                !document.querySelector('.membership-creative-container')) {

                insertBeforeElem = this.getInsertBeforeElem();

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
                    window.addEventListener('scroll', GU.util.debounce(this.isMembershipCreativeInView.bind(this, membershipCreativeContainer, id), 100));
                }
            }
        },

        isMembershipCreativeInView: function(membershipCreative, id) {
            var messageName = 'membership_creative_view/' + id;

            if (this.trackMembershipCreativeView &&
                GU.util.isElementPartiallyInViewport(membershipCreative)) {
                GU.util.signalDevice(messageName);
                this.trackMembershipCreativeView = false;
            }
        },

        getInsertBeforeElem: function() {
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
    });

    return MembershipCreative;
});
/*global window,document,console,define */
define([
    'bean',
    'modules/util'
], function (
    bean,
    util
) {
    'use strict';

    var trackMembershipCreativeView = true,
        modules = {
            setupMembershipCreative: function () {
                window.injectInlineArticleMembershipCreative = modules.injectInlineArticleMembershipCreative;
                window.applyNativeFunctionCall('injectInlineArticleMembershipCreative');
                util.signalDevice("membership_ready");
            },

            injectInlineArticleMembershipCreative: function (html, css, id) {
                if (html && css) {
                    var style,
                        membershipCreativeContainer,
                        insertBeforeElem = document.body.querySelector(".article__body > div.prose > p:nth-of-type(5) ~ p + p, .article__body > div.prose > p:nth-of-type(5) ~ p + h2");

                    if (insertBeforeElem) {
                        //inject css
                        style = document.createElement('style');
                        style.type = 'text/css';
                        if (style.styleSheet){
                            style.styleSheet.cssText = css;
                        } else {
                            style.appendChild(document.createTextNode(css));
                        }
                        document.head.appendChild(style);
                        
                        // inject html
                        membershipCreativeContainer = document.createElement("a");
                        membershipCreativeContainer.href = "x-gu://membership_tap?id=" + id;
                        membershipCreativeContainer.classList.add("membership-creative-container");
                        membershipCreativeContainer.innerHTML = html;
                        insertBeforeElem.parentNode.insertBefore(membershipCreativeContainer, insertBeforeElem);

                        // on scroll check if creative is in viewport
                        bean.on(window, 'scroll', window.ThrottleDebounce.debounce(100, false, modules.isMembershipCreativeInView.bind(null, membershipCreativeContainer, id)));
                    }
                }
            },

            isMembershipCreativeInView: function (membershipCreative, id) {
                var messageName = "membership_view?id=" + id;
                
                if (trackMembershipCreativeView && 
                    util.isElementPartiallyInViewport(membershipCreative)) {
                    util.signalDevice(messageName);
                    trackMembershipCreativeView = false;
                }
            }
        };

    function init() {
        modules.setupMembershipCreative();
    }

    return {
        init: init,
    };

});

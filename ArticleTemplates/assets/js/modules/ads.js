/*global window,document,console,define */
define(function () {
    'use strict';

    var initialised = false,
        positionPoller,
        numberOfMpus = 0,
        adsType;

    function insertAdPlaceholders(mpuAfterParagraphs) {
        var mpu = createMpu(numberOfMpus),
            nrParagraph = (parseInt(mpuAfterParagraphs, 10) || 6) - 1,
            placeholder = document.createElement('div'),
            placeholderSibling = document.querySelector('.article__body > div.prose > :first-child'),
            mpuSibling = document.querySelector('.article__body > div.prose > p:nth-of-type(' + nrParagraph + ') ~ p + p');

        placeholder.classList.add('advert-slot');
        placeholder.classList.add('advert-slot--placeholder');

        // To mimic the correct positioning on full width tablet view, we will need an 
        // empty div to pad out the text so we can position absolutely over it.
        if (placeholderSibling && placeholderSibling.parentNode) {
            placeholderSibling.parentNode.insertBefore(placeholder, placeholderSibling);
        }

        if (mpuSibling && mpuSibling.parentNode) {
            mpuSibling.parentNode.insertBefore(mpu, mpuSibling);
        }
    }

    function updateLiveblogAdPlaceholders(reset) {
        var i,
            advertSlots,
            mpu,
            mpuSibling,
            block,
            blocks = document.querySelectorAll('.article__body > .block');

        if (reset) {
            advertSlots = document.getElementsByClassName('advert-slot--mpu');

            for (i = 0; i < advertSlots.length; i++) {
                advertSlots[i].parentNode.removeChild(advertSlots[i]);
            }

            numberOfMpus = 0;
        }

        for (i = 0; i < blocks.length; i++) {
            block = blocks[i];

            if (i === 1 || i === 6) {
                numberOfMpus++;
                mpu = createMpu(numberOfMpus);

                if (block.nextSibling) {
                    block.parentNode.insertBefore(mpu, block.nextSibling);
                } else {
                    block.parentNode.appendChild(mpu);
                }
            }
        }

        if (reset) {
            if (GU.opts.platform === 'android') {
                updateAndroidPosition();
            } else {
                GU.util.signalDevice('ad_moved');
            }
        }
    }

    function createMpu(id) {
        var mpu = document.createElement('div');

        mpu.classList.add('advert-slot');
        mpu.classList.add('advert-slot--mpu');
        mpu.innerHTML = '<div class="advert-slot__label">' +
                            'Advertisement' +
                            '<a class="advert-slot__action" href="x-gu://subscribe">' +
                                'Hide' +
                                '<span data-icon="&#xe04F;"></span>' +
                            '</a>' +
                        '</div>' +
                        '<div class="advert-slot__wrapper" id="advert-slot__wrapper">' +
                        '<div class="advert-slot__wrapper__content" id="' + id + '"></div>' +
                        '</div>'

        return mpu;
    }

    // return the position of all mpus.
    // This function is an internal function which accepts a function
    // formatter(left1, top1, width1, height1, left2, top2, width2, height2)
    function getMpuPos(formatter) {
        var advertPosition,
            advertSlots = document.getElementsByClassName('advert-slot__wrapper'),
            i,
            scrollLeft = document.body.scrollLeft,
            scrollTop = document.body.scrollTop,
            params = [];

        if (advertSlots.length) {
            scrollLeft = document.body.scrollLeft;
            scrollTop = document.body.scrollTop;
            params = [];

            for (i = 0; i < advertSlots.length; i++) {
                advertPosition = GU.util.getElementOffset(advertSlots[i]);

                if (advertPosition.width !== 0 && advertPosition.height !== 0) {
                    params.push(advertPosition.left + scrollLeft);
                    params.push(advertPosition.top + scrollTop);
                    params.push(advertPosition.width);
                    params.push(advertPosition.height);
                }
            }

            if (params.length > 4) {
                return formatter(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7]);
            } else {
                return formatter(params[0], params[1], params[2], params[3], -1, -1, -1, -1);
            }
        } else {
            return null;
        }
    }

    function getMpuPosCommaSeparated() {
        return getMpuPos(function(x1, y1, w1, h1, x2, y2, w2, h2) {
            if (numberOfMpus > 1) {
                return x1 + ',' + y1 + ',' + x2 + ',' + y2;
            } else {
                return x1 + ',' + y1;
            }
        });
    }

    function getMpuOffset() {
        return getMpuPos(function(x1, y1, w1, h1, x2, y2, w2, h2) {
            if (numberOfMpus > 1) {
                return x1 + "-" + y1 + ":" + x2 + "-" + y2;
            } else {
                return x1 + "-" + y1;
            }
        });
    }

    function updateAndroidPosition() {
        if (adsType === 'liveblog') {
            getMpuPos(function(x1, y1, w1, h1, x2, y2, w2, h2){
                window.GuardianJSInterface.mpuLiveblogAdsPosition(x1, y1, w1, h1, x2, y2, w2, h2);
            });
        } else {
            getMpuPos(function(x1, y1, w1, h1, x2, y2, w2, h2){
                window.GuardianJSInterface.mpuAdsPosition(x1, y1, w1, h1);
            });
        }
    }

    function initMpuPoller() {
        poller(1000,
            getMpuOffset(),
            true
        );
    }

    function poller(interval, adPositions, firstRun) {
        var newAdPositions = getMpuOffset();

        if(firstRun && GU.opts.platform === 'android'){
            updateAndroidPosition();
        }

        if(newAdPositions !== adPositions){
            if(GU.opts.platform === 'android'){
                updateAndroidPosition();
            } else {
                GU.util.signalDevice('ad_moved');
            }
        }

        positionPoller = setTimeout(poller.bind(null, interval + 50, newAdPositions), interval);
    }

    function killMpuPoller() {
        window.clearTimeout(positionPoller);
        positionPoller = null;
    }

    function fireAdsReady() {
        if (!document.body.classList.contains('no-ready') && GU.opts.useAdsReady === 'true') {
            GU.util.signalDevice('ads-ready');
        }
    }

    // Used by quizzes to move the advert
    function updateMPUPosition(yPos) {
        var advertSlot = document.getElementsByClassName('advert-slot__wrapper')[0],
            newYPos;

        if (advertSlot) {
            newYPos = GU.util.getElementOffset(advertSlot).top;

            if(newYPos !== yPos){
                if (GU.opts.platform === 'android') {
                    updateAndroidPosition();
                } else {
                    GU.util.signalDevice('ad_moved');
                }
            }
        }

        return newYPos;
    }

    function setupGlobals() {
        window.initMpuPoller = initMpuPoller;
        window.killMpuPoller = killMpuPoller;
        window.getMpuPosCommaSeparated = getMpuPosCommaSeparated;
        window.updateLiveblogAdPlaceholders = updateLiveblogAdPlaceholders;

        window.applyNativeFunctionCall('initMpuPoller');
    }

    function ready(config) {
        if (!initialised && config.adsEnabled) {
            initialised = true;
            adsType = config.adsType;

            setupGlobals();

            if (adsType === 'liveblog') {
                updateLiveblogAdPlaceholders();
            } else {
                numberOfMpus = 1;
                insertAdPlaceholders(config.mpuAfterParagraphs);
            }

            if (GU.opts.platform !== 'android') {
                initMpuPoller();
            }

            fireAdsReady();
        }
    }

    return {
        init: ready,
        updateMPUPosition: updateMPUPosition
    };

});

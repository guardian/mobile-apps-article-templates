import { signalDevice, getElementOffset } from "modules/util";

let adsReady = false;
let numberOfMpus = 0;
let positionPoller;
let adsType;

function insertAdPlaceholders(mpuAfterParagraphs) {
    const mpu = createMpu(numberOfMpus);
    const nrParagraph = (parseInt(mpuAfterParagraphs, 10) || 6) - 1;
    const placeholder = document.createElement('div');
    const placeholderSibling = document.querySelector('.article__body > div.prose > :first-child');
    const mpuSibling = document.querySelector(`.article__body > div.prose > p:nth-of-type(${nrParagraph}) ~ p + p`);

    if (!(mpuSibling && mpuSibling.parentNode)) {
        // Not enough paragraphs on page to add advert
        return;
    }

    mpuSibling.parentNode.insertBefore(mpu, mpuSibling);

    placeholder.classList.add('advert-slot');
    placeholder.classList.add('advert-slot--placeholder');

    // To mimic the correct positioning on full width tablet view, we will need an 
    // empty div to pad out the text so we can position absolutely over it.
    if (placeholderSibling && placeholderSibling.parentNode) {
        placeholderSibling.parentNode.insertBefore(placeholder, placeholderSibling);
    }

    adsReady = true;
}

function updateLiveblogAdPlaceholders(reset) {
    let i;
    let advertSlots;
    let mpu;
    let block;
    // The selector here is taking all .block elements within article body
    // which are not siblings of contributions-epic__container
    const blocks = document.querySelectorAll('.article__body > .block:first-child, .article__body > div:not(.contributions-epic__container) + .block');

    if (reset) {
        advertSlots = document.getElementsByClassName('advert-slot--mpu');

        while(advertSlots.length > 0){
            advertSlots[0].parentNode.removeChild(advertSlots[0]);
        }

        numberOfMpus = 0;
    }

    for (i = 0; i < blocks.length; i++) {
        block = blocks[i];

        if (i === 2 || i === 7) {
            numberOfMpus++;
            mpu = createMpu(numberOfMpus);

            if (block.nextSibling) {
                block.parentNode.insertBefore(mpu, block);
            } else {
                block.parentNode.appendChild(mpu);
            }
        }
    }

    if (reset) {
        if (GU.opts.platform === 'android') {
            updateAndroidPosition();
        } else {
            signalDevice('ad_moved');
        }
    }
}

function createMpu(id) {
    const mpu = document.createElement('div');

    mpu.classList.add('advert-slot');
    mpu.classList.add('advert-slot--mpu');
    mpu.innerHTML = `
        <div class="advert-slot__label">
            Advertisement<a class="advert-slot__action" href="x-gu://subscribe">Hide<span data-icon="&#xe04F;"></span></a>
        </div>
        <div class="advert-slot__wrapper" id="advert-slot__wrapper">
            <div class="advert-slot__wrapper__content" id="${id}"></div>
        </div>
    `;

    return mpu;
}

function getMpuPos(formatter) {
    const advertSlots = document.getElementsByClassName('advert-slot__wrapper');
    const scrollLeft = document.scrollingElement ? document.scrollingElement.scrollLeft : document.body.scrollLeft;
    const scrollTop = document.scrollingElement ? document.scrollingElement.scrollTop : document.body.scrollTop;
    let advertPosition;
    let i;

    const params = {
        x1: -1,
        y1: -1,
        w1: -1,
        h1: -1,
        x2: -1,
        y2: -1,
        w2: -1,
        h2: -1
    };

    if (advertSlots.length) {
        for (i = 0; i < advertSlots.length; i++) {
            advertPosition = advertSlots[i].getBoundingClientRect();

            if (advertPosition.width !== 0 && advertPosition.height !== 0) {
                params[`x${i + 1}`] = advertPosition.left + scrollLeft;
                params[`y${i + 1}`] = advertPosition.top + scrollTop;
                params[`w${i + 1}`] = advertPosition.width;
                params[`h${i + 1}`] = advertPosition.height;
            }
        }

        return formatter(params);
    }

    return null;
}

function getMpuPosCommaSeparated() {
    return getMpuPos(getMpuPosCommaSeparatedCallback);
}

function getMpuPosCommaSeparatedCallback(params) {
    return (numberOfMpus > 1)
        ? `${params.x1},${params.y1},${params.x2},${params.y2}`
        : `${params.x1},${params.y1}`;
}

function getMpuOffset() {
    return getMpuPos(getMpuOffsetCallback);
}

function getMpuOffsetCallback(params) {
    return (numberOfMpus > 1)
        ? `${params.x1}-${params.y1}:${params.x2}-${params.y2}`
        : `${params.x1}-${params.y1}`;
}

function updateAndroidPosition() {
    if (adsType === 'liveblog') {
        getMpuPos(updateAndroidPositionLiveblogCallback);
    } else {
        getMpuPos(updateAndroidPositionDefaultCallback);
    }
}

function updateAndroidPositionLiveblogCallback({ x1, y1, w1, h1, x2, y2, w2, h2 }) {
    window.GuardianJSInterface.mpuLiveblogAdsPosition(x1, y1, w1, h1, x2, y2, w2, h2);
}

function updateAndroidPositionDefaultCallback({ x1, y1, w1, h1 }) {
    window.GuardianJSInterface.mpuAdsPosition(x1, y1, w1, h1);
}

function initMpuPoller(interval = 1000) {
    if (positionPoller !== null) {
        window.clearTimeout(positionPoller);
    }

    poller(interval,
        getMpuOffset(),
        true
    );
}

function poller(interval, adPositions, firstRun) {
    var newAdPositions = getMpuOffset();

    if (firstRun && GU.opts.platform === 'android') {
        updateAndroidPosition();
    }

    if (newAdPositions !== adPositions) {
        if(GU.opts.platform === 'android'){
            updateAndroidPosition();
        } else {
            signalDevice('ad_moved');
        }
    }

    positionPoller = setTimeout(poller.bind(null, interval + 50, newAdPositions), interval);
}

function killMpuPoller() {
    window.clearTimeout(positionPoller);
    positionPoller = null;
}

function fireAdsReady() {
    if (!document.body.classList.contains('no-ready') && GU.opts.useAdsReady) {
        signalDevice('ads-ready');
    }
}

// Used by quizzes to move the advert
function updateMPUPosition(yPos) {
    const advertSlot = document.getElementsByClassName('advert-slot__wrapper')[0];
    let newYPos;

    if (advertSlot) {
        newYPos = getElementOffset(advertSlot).top;

        if (newYPos !== yPos){
            if (GU.opts.platform === 'android') {
                updateAndroidPosition();
            } else {
                signalDevice('ad_moved');
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

function init(config) {
    adsType = config.adsType;
    setupGlobals();

    if (adsType === 'liveblog') {
        adsReady = true;
        updateLiveblogAdPlaceholders();
    } else {
        numberOfMpus = 1;
        insertAdPlaceholders(config.mpuAfterParagraphs);
    }
 
    if (adsReady) {
        if (GU.opts.platform !== 'android') {
            initMpuPoller();
        }
        fireAdsReady();
    }
}

export { init, updateMPUPosition, initMpuPoller };
import { signalDevice, getElementOffset } from "modules/util";

let adsReady = false;
let numberOfMpus = 0;
let positionPoller;
let adsType;
let hideAdsTest = 0;

function insertAdPlaceholdersGallery(mpuAfterImages) {
    const mpu = createMpu(numberOfMpus);
    const nrImages = (parseInt(mpuAfterImages, 10) || 6) - 1;
    const placeholder = document.createElement('div');
    const images = document.querySelectorAll(`.gallery .touch-gallery .touch-gallery__images`);

    if (nrImages > images.length) {
        // Not enough images
        return;
    }

    const image = images[nrImages];
    image.parentNode.insertBefore(mpu, image);
    placeholder.classList.add('advert-slot');
    adsReady = true;
}

function insertAdPlaceholders(mpuAfterParagraphs, amountOfMpu) {
    for (let i = 1; numberOfMpus < amountOfMpu; i=i+2) {
        const mpu = createMpu(i);
        const nrParagraph = (parseInt(mpuAfterParagraphs * i, 10) || 6 * i) - 1;
        const placeholder = document.createElement('div');
        const placeholderSibling = document.querySelector('.article__body > div.prose > :first-child');
        const mpuSibling = document.querySelector(`.article__body > div.prose > p:nth-of-type(${nrParagraph}) ~ p + p`);

        if (!(mpuSibling && mpuSibling.parentNode)) {
            // Not enough paragraphs on page to add advert
            break;
        }

        mpuSibling.parentNode.insertBefore(mpu, mpuSibling);
        placeholder.classList.add('advert-slot');

        // To mimic the correct positioning on full width tablet view, we will need an
        // empty div to pad out the text so we can position absolutely over it.
        if (placeholderSibling && placeholderSibling.parentNode) {
            placeholderSibling.parentNode.insertBefore(placeholder, placeholderSibling);
        }
        numberOfMpus++;
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

    switch (hideAdsTest) {
        case 0:
            mpu.innerHTML = `
                <div class="advert-slot__label">
                    Advertisement<a class="advert-slot__action" href="x-gu://subscribe">Hide<span data-icon="&#xe04F;"></span></a>
                </div>
                <div class="advert-slot__wrapper advert-slot__wrapper--${id}" id="advert-slot__wrapper">
                    <div class="advert-slot__wrapper__content" id="${id}"></div>
                </div>
            `;
            return mpu;

        case 1:
            mpu.innerHTML = `
                <div class="advert-slot__label">
                    <a class="advert-slot__action test" href="x-gu://subscribe">Hide this and other advertisements<span data-icon="&#xe04F;"></span></a>
                </div>
                <div class="advert-slot__wrapper advert-slot__wrapper--${id} test" id="advert-slot__wrapper">
                    <div class="advert-slot__wrapper__content" id="${id}"></div>
                </div>
            `;
            return mpu;

        case 2:
            mpu.innerHTML = `
            <div class="advert-slot__label">
                Advertisement
            </div>
            <div class="advert-slot__wrapper advert-slot__wrapper--${id} test__banner" id="advert-slot__wrapper">
                <div class="advert-slot__wrapper__content" id="${id}"></div>
            </div>
            <div class="advert-slot__upgrade">
                <h1>Support the Guardian and enjoy the app ad-free.</h1>
                <a href="x-gu://subscribe" role="button">Support the Guardian</a>
            </div>
        `;
        return mpu;
    }
}

// this function is called by iOS
function getMpuPos(formatter) {
    const advertSlots = document.getElementsByClassName('advert-slot__wrapper');
    const scrollLeft = document.scrollingElement ? document.scrollingElement.scrollLeft : document.body.scrollLeft;
    const scrollTop = document.scrollingElement ? document.scrollingElement.scrollTop : document.body.scrollTop;
    const params = [];
    let advertPosition;

    if (advertSlots.length) {
        for (let i = 0; i < advertSlots.length; i++) {
            advertPosition = advertSlots[i].getBoundingClientRect();

            if (advertPosition.width !== 0 && advertPosition.height !== 0) {
                params.push({
                    x: advertPosition.left + scrollLeft,
                    y: advertPosition.top + scrollTop,
                    width: advertPosition.width,
                    height: advertPosition.height
                })
            }
        }

        return formatter ? formatter(params) : params;
    }

    return null;
}

function updateAndroidPosition() {
    if (adsType === 'liveblog') {
        getMpuPos(updateAndroidPositionLiveblogCallback);
    } else {
        getMpuPos(updateAndroidPositionDefaultCallback);
    }
}

function updateAndroidPositionLiveblogCallback(adSlots) {
    window.GuardianJSInterface.mpuLiveblogAdsPosition(JSON.stringify(adSlots));
}

function updateAndroidPositionDefaultCallback(adSlots) {
    window.GuardianJSInterface.mpuAdsPosition(JSON.stringify(adSlots));
}

function initMpuPoller(interval = 1000, firstRun = true) {
    if (positionPoller !== null) {
        window.clearTimeout(positionPoller);
    }

    poller(interval,
        getMpuPos(),
        firstRun
    );
}

function poller(interval, adPositions, firstRun) {
    let newAdPositions = getMpuPos();

    if (firstRun && GU.opts.platform === 'android') {
        updateAndroidPosition();
    } else if (firstRun) {
        signalDevice('ad_moved');
    }

    if (JSON.stringify(newAdPositions) !== JSON.stringify(adPositions)) {
        if (GU.opts.platform === 'android'){
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
    window.getMpuPos = getMpuPos;
    window.updateLiveblogAdPlaceholders = updateLiveblogAdPlaceholders;

    window.applyNativeFunctionCall('initMpuPoller');
}

function init(config) {
    adsType = config.adsType;
    hideAdsTest = config.hideAdsTest || 0;
    const maximumAdverts = 15;
    setupGlobals();

    if (adsType === 'liveblog') {
        adsReady = true;
        updateLiveblogAdPlaceholders();
    } else if (adsType === 'gallery') {
        numberOfMpus = 1;
        const mpuAfterImages = 4;
        insertAdPlaceholdersGallery(mpuAfterImages);
    } else if (maximumAdverts) {
        numberOfMpus = 0;
        insertAdPlaceholders(config.mpuAfterParagraphs, maximumAdverts);
    }

    if (adsReady) {
        if (GU.opts.platform !== 'android') {
            initMpuPoller();
        }
        fireAdsReady();
    }
}

export { init, updateMPUPosition, initMpuPoller };

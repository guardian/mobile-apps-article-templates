import {
    debounce,
    signalDevice,
    isElementPartiallyInViewport,
} from 'modules/util';

let scrollListenerFunction;

const adFreeSvg = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
            <circle cx="40" cy="40" r="40" fill="#C4C4C4"/>
        </mask>
        <g mask="url(#mask0)">
            <rect x="-10.5261" y="-4.21094" width="98.9474" height="92.6316" fill="#00B2FF"/>
            <g opacity="0.5">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M98.9479 -1.05273H40.0005V1.05253H98.9479V-1.05273ZM98.9481 3.15789H40.0007V5.26316H98.9481V3.15789ZM98.9481 7.36893H40.0007V9.4742H98.9481V7.36893ZM40.0007 11.5789H98.9481V13.6842H40.0007V11.5789ZM98.9481 15.7895H40.0007V17.8947H98.9481V15.7895ZM40.0007 20H61.0533V22.1053H40.0007V20ZM98.9481 24.2105H40.0007V26.3158H98.9481V24.2105ZM40.0007 28.4216H98.9481V30.5268H40.0007V28.4216ZM98.9481 32.6316H40.0007V34.7368H98.9481V32.6316ZM40.0007 36.8421H98.9481V38.9474H40.0007V36.8421ZM98.9481 41.0526H40.0007V43.1579H98.9481V41.0526ZM40.0007 45.2626H98.9481V47.3679H40.0007V45.2626ZM71.5797 49.4737H40.0007V51.5789H71.5797V49.4737ZM40.0007 53.6842H98.9481V55.7895H40.0007V53.6842ZM98.9481 57.8947H40.0007V60H98.9481V57.8947ZM40.0007 62.1058H98.9481V64.211H40.0007V62.1058ZM98.9481 66.3158H40.0007V68.4211H98.9481V66.3158ZM40.0007 70.5263H98.9481V72.6316H40.0007V70.5263ZM98.9481 74.7374H40.0007V76.8426H98.9481V74.7374ZM40.0007 78.9469H98.9481V81.0521H40.0007V78.9469Z" fill="#C1D8FC"/>
            </g>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M29.4747 13.6846C29.4747 28.2184 17.6927 40.0004 3.15894 40.0004C17.6927 40.0004 29.4747 51.7824 29.4747 66.3161C29.4747 51.7824 41.2567 40.0004 55.7905 40.0004C41.2567 40.0004 29.4747 28.2184 29.4747 13.6846Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M54.7373 44.2109C54.7373 51.1872 49.0819 56.8425 42.1057 56.8425C49.0819 56.8425 54.7373 62.4979 54.7373 69.4741C54.7373 62.4979 60.3927 56.8425 67.3689 56.8425C60.3927 56.8425 54.7373 51.1872 54.7373 44.2109Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M47.3676 7.36914C47.3676 13.1827 42.6548 17.8955 36.8413 17.8955C42.6548 17.8955 47.3676 22.6083 47.3676 28.4218C47.3676 22.6083 52.0804 17.8955 57.8939 17.8955C52.0804 17.8955 47.3676 13.1827 47.3676 7.36914Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M64.2112 24.2109C64.2112 27.1177 61.8548 29.4741 58.948 29.4741C61.8548 29.4741 64.2112 31.8305 64.2112 34.7373C64.2112 31.8305 66.5676 29.4741 69.4743 29.4741C66.5676 29.4741 64.2112 27.1177 64.2112 24.2109Z" fill="white"/>
        </g>
    </svg>
`

let offlineSvg = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
            <circle cx="40" cy="40" r="40" fill="#C4C4C4"/>
        </mask>
        <g mask="url(#mask0)">
            <rect x="-10.5263" y="-6.31543" width="212.632" height="168.421" fill="#C1D8FC"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M57.7512 32.5835C59.1565 31.9993 60.6809 31.7222 62.2009 31.7222C68.5426 31.7222 73.6842 36.8639 73.6842 43.2055C73.6842 49.5471 68.5426 54.6887 62.2009 54.6887H54.3062L54.3039 54.6846H43.6717C43.6441 54.686 43.6163 54.6874 43.5885 54.6887C40.5091 54.8385 22.0096 54.6887 22.0096 54.6887C15.678 54.6887 10.5263 49.5371 10.5263 43.2055C10.5263 38.6969 13.6038 34.3261 17.8469 32.4399C17.8469 24.1289 24.6694 17.3682 33.0622 17.3682C39.5947 17.3682 45.1569 21.871 47.1292 28.1337C51.1383 27.9557 55.0828 29.5677 57.7512 32.5835ZM36.8421 50.3825H22.0096C17.9933 50.3825 14.8325 47.1744 14.8325 43.2055C14.8325 39.9098 17.4966 36.8696 20.5742 36.0285L21.866 38.8993L23.5885 38.3251C23.5583 38.2432 23.528 38.1615 23.4978 38.0799C22.8164 36.2388 22.1531 34.4466 22.1531 32.4399C22.1531 26.493 27.0306 21.6744 33.0622 21.6744C39.0866 21.6744 43.5407 27.2136 43.5407 33.1576C48.6033 30.9471 54.912 33.5294 56.4593 38.8993C57.7799 37.138 60.0033 36.0285 62.2009 36.0285C66.1655 36.0285 69.378 39.2423 69.378 43.2055C69.378 47.1686 66.1655 50.3825 62.2009 50.3825H57.8947V50.3793H36.8421V50.3825Z" fill="#001536"/>
            <rect x="11.3158" y="61.7559" width="69.4737" height="3.94737" transform="rotate(-45 11.3158 61.7559)" fill="#001536"/>
            <rect x="14.107" y="64.5469" width="69.4737" height="3.94737" transform="rotate(-45 14.107 64.5469)" fill="#C1D8FC"/>
        </g>
    </svg>
`

const signalPaths = {
    adFree: {
        seen: 'premiumTaster/adFreePremiumTasterSeen',
        dismissed: 'premiumTaster/adFreePremiumTasterDismissed'
    },
    offline: {
        seen: 'premiumTaster/offlinePremiumTasterSeen',
        dismissed: 'premiumTaster/offlinePremiumTasterDismissed'
    }
}
function init() {
    window.adFreeTasterSetup = adFreeTasterSetup
    window.offlineTasterSetup = offlineTasterSetup
    window.indicatorHtml  = indicatorHtml
}

function indicatorHtml(taster) {
    console.log("before check")
    if (taster !== "adFree" && taster !== "offline") return "";
    console.log("after check")
    var text = ""
    var svg = ""
    if (taster === "adFree") {
        text = "Experiencing the app ad free is a Premium feature. As a new user you can enjoy it for <strong>free for one week.</strong>"
        svg = adFreeSvg
    }

    if (taster === "offline") {
        text = "Enhanced offline reading is a Premium feature. As a new user you can enjoy it for <strong>free for one week.</strong>"
        svg = offlineSvg
    }

    return `
        <span class="icon">${svg}</span>
        ${text}
        <button>OK</button>
    `
}

function setupTasterIndicator(html, signalPath) {
    const afterParagraphs = 3;
    const placeholder = document.createElement('div');
    const premiumTasterIndicatorSibling = document.querySelector(`.article__body > div.prose > p:nth-of-type(${afterParagraphs - 1}) ~ p + p`);

    if (!(premiumTasterIndicatorSibling && premiumTasterIndicatorSibling.parentNode)) {
        // Not enough paragraphs on page to add premium taster indicator
        return;
    }

    const node = document.createElement('div');

    node.innerHTML = html;

    placeholder.appendChild(node);
    placeholder.classList.add("premium-taster-indicator", "js-premium-taster-indicator");
    premiumTasterIndicatorSibling.parentNode.insertBefore(placeholder, premiumTasterIndicatorSibling);
    scrollListenerFunction = debounce(isIndicatorInView.bind(null, placeholder), 100);
    window.addEventListener('scroll', scrollListenerFunction);

    setupButton();

    function isIndicatorInView(indicator) {
        if (isElementPartiallyInViewport(indicator)) {
            signalDevice(signalPath.seen);
            window.removeEventListener('scroll', scrollListenerFunction);
        }
    }

    function setupButton() {
        const indicatorTasterContainer = document.querySelector(".js-premium-taster-indicator");
        const button = indicatorTasterContainer.querySelector('button');
        button.addEventListener('click', () => {
            signalDevice(signalPath.dismissed);
            indicatorTasterContainer.remove()
        })
    }
}

function offlineTasterSetup() {
    setupTasterIndicator(indicatorHtml("offline"), signalPaths.offline)
}

function adFreeTasterSetup() {
    setupTasterIndicator(indicatorHtml("adFree"), signalPaths.adFree)
}


export { init };

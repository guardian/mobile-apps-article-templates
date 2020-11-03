import {
    debounce,
    signalDevice,
    isElementPartiallyInViewport,
} from 'modules/util';

let scrollListenerFunction;

const svg = `
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
function init() {
    window.adFreeTasterSetup = adFreeTasterSetup
}

function adFreeTasterSetup() {
    const afterParagraphs = 3;
    const placeholder = document.createElement('div');
    const adFreeTasterSibling = document.querySelector(`.article__body > div.prose > p:nth-of-type(${afterParagraphs - 1}) ~ p + p`);

    if (!(adFreeTasterSibling && adFreeTasterSibling.parentNode)) {
        // Not enough paragraphs on page to add adFree taster
        return;
    }

    const node = document.createElement('div');

    node.innerHTML = `
        <span class="icon">${svg}</span>
        Experiencing the app ad free is a Premium feature. As a new user you can enjoy it for <strong>free for one week.</strong>
        <button>OK</button>
    `;

    placeholder.appendChild(node);
    placeholder.classList.add('ad-free-taster', 'js-ad-free-taster');
    adFreeTasterSibling.parentNode.insertBefore(placeholder, adFreeTasterSibling);
    scrollListenerFunction = debounce(isAdFreePremiumTasterInView.bind(null, placeholder), 100);
    window.addEventListener('scroll', scrollListenerFunction);

    setupButton();
}

function isAdFreePremiumTasterInView(AdFreePremiumTaster) {
    if (isElementPartiallyInViewport(AdFreePremiumTaster)) {
        console.log("taster in viewport, report to native layers");
        signalDevice('trackPremiumTaster/AdFreePremiumTasterSeen');
        window.removeEventListener('scroll', scrollListenerFunction);
    }
}

function setupButton() {
    const adFreeTasterContainer = document.querySelector('.js-ad-free-taster');
    const button = adFreeTasterContainer.querySelector('button');
    button.addEventListener('click', () => {
        console.log("removing ad free button")
        adFreeTasterContainer.remove()
    })
}

export { init };

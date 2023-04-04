import { initPositionPoller } from 'modules/cards';
import { resetAndCheckForVideos } from 'modules/youtube';
import { initMpuPoller } from 'modules/ads';
import { POST } from 'modules/http';
import { scrollToElement } from 'modules/util';

const endpoint = GU.opts.campaignsUrl;
const confirmationHtml = '<div class="success__container"><div class="success__icon"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM13.1636 19.435L9.53052 15.9642L8.25228 17.2425L12.5856 23.3091H13.3114L25.2403 10.9631L23.9273 9.68294L13.1636 19.435Z" fill="#22874D" /></svg></div><div class="success__header">Thank you!</div><div class="success__body">Your story has been submitted successfully. One of our journalists will be in touch if we wish to take your submission further.</div></div>';
function init() {
    var campaign = document.querySelector('.campaign--snippet');
    if (campaign) {
        initCampaign(campaign);
    }
}

function readFile(file, campaign, form) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        setTimeout(reject, 30000);

        reader.addEventListener('load', () => {
                const fileAsBase64 = reader.result
                    .toString()
                    .split(';base64,')[1];
                // remove data:*/*;base64, from the start of the base64 string
                resolve(fileAsBase64);
            }
        );

        reader.addEventListener('error', () => {
            reject();
        });

        reader.readAsDataURL(file);
    })
}

function initCampaign(campaign) {
    if (!navigator.onLine) {
        displayOfflineMessage(campaign);
    }

    campaign.addEventListener('toggle', function() {
        resetAndCheckForVideos();
        initPositionPoller();
        initMpuPoller(0);
    });

    window.addEventListener('online', hideOfflineMessage.bind(null, campaign));
    window.addEventListener('offline', displayOfflineMessage.bind(null, campaign));

    let form = campaign.querySelector('form');
    let promises = [];
    let keys = [];
    form.addEventListener('submit', function (e) {
        displayWaiting(form);
        e.preventDefault();
        var data = Array.from(form.elements).reduce(function (o, e) {
            if (e.type === 'checkbox') {
                if (e.checked) {
                    o[e.name] = o[e.name] ? o[e.name] + '\n' + e.value : e.value;
                }
            } else if (e.type === 'file' && e.files.length) {
                const filePromise = readFile(e.files[0], campaign, form);
                promises.push(filePromise);
                keys.push(e.name);
                o[e.name] = filePromise;
            } else if (e.value) {
                o[e.name] = e.value;
            }

            return o;
        }, {});

        Promise.all(promises).then(results => {
            results.map((result, index) => {
                data[keys[index]] = result;
            })
            submit(data, campaign, form);
        }).catch(() => {
            displayFileError(campaign, form);
        })
    });
}

function submit(data, campaign, form) {
    hideError();
    const onLoadCallout = displayConfirmation.bind(null, campaign, form);
    const onErrorCallout = displayError.bind(null, campaign, form);
    POST(endpoint, onLoadCallout, onErrorCallout, JSON.stringify(data))
}

function displayOfflineMessage(campaign) {
    campaign.insertAdjacentHTML('afterbegin', '<p class="campaign__offline">You seem to have no connection to the Internet. You won\'t be able to send us anything until you have one.</p>');
}

function hideOfflineMessage(campaign) {
    if (campaign.firstElementChild.className === 'campaign__offline') {
        campaign.removeChild(campaign.firstElementChild);
    }
}

function displayConfirmation(campaign, form) {
    form.innerHTML = confirmationHtml
    scrollToElement(campaign);
    resetAndCheckForVideos();
    initPositionPoller();
    initMpuPoller(0);
}

function displayError(campaign, form) {
    const formError = document.querySelector('.js-form-error');
    if (formError) {
        formError.style.display = 'block';
    }
    enableButton(form);
}

function displayFileError(campaign, form) {
    const fileError = document.querySelector('.js-file-error');
    if (fileError) {
        fileError.style.display = 'block';
    }
    enableButton(form);
}

function hideError() {
    const formError = document.querySelector('.js-form-error');
    const fileError = document.querySelector('.js-file-error');
    if (formError) {
        formError.style.display = 'none';
    }

    if (fileError) {
        fileError.style.display = 'none';
    }
}

function displayWaiting(form) {
    var button = form.querySelector('.form_submit button');
    button.textContent = 'Sending...';
    disableButton(form);
}

function disableButton(form) {
    var button = form.querySelector('button');
    button.disabled = true;
}

function enableButton(form) {
    var button = form.querySelector('button');
    button.disabled = false;
    button.textContent = 'Share with the Guardian';
}

export { init, initCampaign };

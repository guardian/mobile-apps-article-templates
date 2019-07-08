import { initPositionPoller } from 'modules/cards';
import { resetAndCheckForVideos } from 'modules/youtube';
import { initMpuPoller } from 'modules/ads';
import { POST } from 'modules/http';
import { scrollToElement } from 'modules/util';

const endpoint = GU.opts.campaignsUrl;

function init() {
    var campaign = document.querySelector('.campaign--snippet');
    if (campaign) {
        initCampaign(campaign);
    }
}

function readFile(file, campaign, form) {
    return new Promise(res => {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
                const fileAsBase64 = reader.result
                    .toString()
                    .split(';base64,')[1];
                // remove data:*/*;base64, from the start of the base64 string
                res(fileAsBase64);
            }
        );

        reader.addEventListener('error', () => {
            displayFileError(campaign, form);
            res(null);
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

    var form = campaign.querySelector('form');
    form.addEventListener('submit', function (e) {
        displayWaiting(form);
        e.preventDefault();
        var data = Array.from(form.elements).reduce(function (o, e) {
            if (e.type === 'checkbox') {
                if (e.checked) {
                    o[e.name] = o[e.name] ? o[e.name] + '\n' + e.value : e.value;
                }
            } else if (e.type === 'file') {
                o[e.name] = readFile(e.files[0], campaign, form);
            } else if (e.value) {
                o[e.name] = e.value;
            }
            
            return o;    
        }, {});

        let promises = [];
        let keys = [];
        for (var key in data) {
            if (data.hasOwnProperty(key) && data[key] instanceof Promise) {
                keys.push(key)
                promises.push(data[key]);
            }
        }

        Promise.all(promises).then(results => {
            results.map((result, index) => {
                data[keys[index]] = result;
            })

            disableButton(form);
            submit(data, campaign, form);
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
    form.innerHTML = '<p>Thank you for your contribution</p>';
    campaign.className += ' campaign--success';
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

export { init };

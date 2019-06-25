import { initPositionPoller } from 'modules/cards';
import { resetAndCheckForVideos } from 'modules/youtube';
import { initMpuPoller } from 'modules/ads';
import { POST } from 'modules/http';
  
function init() {
    var campaign = document.querySelector('.campaign--snippet');
    if (campaign) {
        initCampaign(campaign);
    }
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
        e.preventDefault();
        var data = Array.from(form.elements).reduce(function (o, e) {
            if (e.type === 'checkbox') {
                if (e.checked) {
                    o[e.name] = o[e.name] ? o[e.name] + '\n' + e.value : e.value;
                }
            } else if (e.value) {
                o[e.name] = e.value;
            }
            
            return o;    
        }, {});
        disableButton(form);
        submit(data, campaign, form);
    });
}

function submit(data, campaign, form) {
    hideError();
    displayWaiting(form);
    const onLoadCallout = displayConfirmation.bind(null, campaign, form);
    const onErrorCallout = displayError.bind(null, campaign, form);
    POST("https://callouts.code.dev-guardianapis.com/formstack-campaign/submit", onLoadCallout, onErrorCallout, JSON.stringify(data))
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

function hideError() {
    const formError = document.querySelector('.js-form-error');
    if (formError) {
        formError.style.display = 'none';
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

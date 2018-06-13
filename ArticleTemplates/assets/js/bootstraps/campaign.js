define([], function () {
    'use strict';

    const rootPath = 'https://code.api.nextgen.guardianapps.co.uk/formstack-campaign/submit'

    function init() {
      const campaign = document.querySelector('.campaign--snippet form');
      if (campaign) {
        initCampaign(campaign);
      }
    }

    function initCampaign(campaign) {
      if (!navigator.onLine) {
        displayOfflineMessage(campaign);
      }

      window.addEventListener('online', hideOfflineMessage.bind(null, campaign));
      window.addEventListener('offline', displayOfflineMessage.bind(null, campaign));

      campaign.addEventListener('submit', function (e) {
        e.preventDefault();
        const data = new FormData(campaign);
        const json = {};
        for(let [key, value] of data.entries()) {
          json[key] = value;
        }
        
        submit(json, campaign);
      });
    }

    function submit(json, campaign) {
      const req = new XMLHttpRequest();
      req.open('POST', rootPath);
      req.setRequestHeader('Accept', 'application/json');
      req.setRequestHeader('Content-Type', 'application/json');
      req.setRequestHeader('X-Requested-With', 'Guardian Mobile App');
      req.withCredentials = true;
      req.onload = displayConfirmation.bind(null, campaign);
      req.onerror = displayError.bind(null, campaign);
      req.send(JSON.stringify(json));
    }

    function displayOfflineMessage(campaign) {
      campaign.insertAdjacentHTML('afterbegin', '<p class="campaign__offline">You seem to have no connection to the Internet. You won\'t be able to send us anything until you have one.</p>')
    }

    function hideOfflineMessage(campaign) {
      if (campaign.firstElementChild.className === 'campaign__offline') {
        campaign.removeChild(campaign.firstElementChild);
      }
    }

    function displayConfirmation(campaign) {
      campaign.innerHTML = '<p>Thank you for your contribution</p>';
    }

    function displayError(campaign) {
      if (! (campaign.firstChild.nodeType === Node.ELEMENT_NODE && campaign.firstChild.className === 'campaign__error') ) {
        campaign.insertAdjacentHTML('afterbegin', '<p class="campaign__error">Sorry, there was an error submitting your contribution. Please, try again.</p>');
      }
    }

    return {
      init: init
    };
});

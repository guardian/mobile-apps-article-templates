define([], function () {
    'use strict';

    const rootPath = 'https://api.nextgen.guardianapps.co.uk/formstack-campaign/submit'

    function init() {
      const campaign = document.querySelector('.campaign--snippet form');
      if (campaign) {
        initCampaign(campaign);
      }
    }

    function initCampaign(campaign) {
      campaign.addEventListener('submit', function () {
        const data = new FormData(campaign);
        const json = {};
        for([key, value] of data.entries()) {
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
      req.onload = displayConfirmation.bind(null, campaign);
      req.onerror = displayError.bind(null, campaign);
      req.send(JSON.stringify(json));
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

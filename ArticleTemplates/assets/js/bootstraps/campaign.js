define([], function () {
    'use strict';

    function init() {
      const campaign = document.querySelector('.campaign--snippet form');
      if (campaign) {
        initCampaign(campaign);
      }
    }

    function initCampaign(campaign) {
      campaign.onSubmit(function () {
        const data = new FormData(campaign);
        const json = {};
        for([key, value] of data.entries()) {
          json[key] = value;
        }
        location.hash = JSON.stringify(json);
      });
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

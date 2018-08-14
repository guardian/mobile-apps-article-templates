define([
  'modules/cards'
], function (cards) {
    'use strict';

    var endpoint = GU.opts.campaignsUrl;

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

      campaign.addEventListener('toggle', cards.initPositionPoller);
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
      displayWaiting(form);
      var req = new XMLHttpRequest();
      req.open('POST', endpoint);
      req.setRequestHeader('Content-Type', 'application/json');
      req.setRequestHeader('Accept', 'application/json');
      req.onload = displayConfirmation.bind(null, campaign, form);
      req.onerror = displayError.bind(null, campaign, form);
      req.send(JSON.stringify(data));
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
    }

    function displayError(campaign, form) {
      if (form.firstElementChild.className === 'campaign__error') {
        form.insertAdjacentHTML('afterbegin', '<p class="campaign__error">Sorry, there was an error submitting your contribution. Please, try again.</p>');
      }
      enableButton(form);
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

    return {
      init: init
    };
});

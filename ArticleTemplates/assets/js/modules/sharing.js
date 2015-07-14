define([
    'bean',
    'bonzo',
    'qwery',
    'modules/$'
], function (
    bean,
    bonzo,
    qwery,
    $
) {

    var modules = {
        nativeSharing: function(_window, service, url, title){
            var action;
            if(service === 'facebook'){
                action = 'x-gu://facebookshare/';
            }
            if(service === 'twitter'){
                action = 'x-gu://twittershare/';
            }

            if(action && url){
                action = action + "?url=" + encodeURIComponent(url);
                if(title){
                    action = action + "&title=" + encodeURIComponent(title);
                }
                _window.location.href = action;
            }
        }
    };

    function bootstrap(_window){
        if($('body').hasClass('ios')){
            _window.nativeSharing = modules.nativeSharing.bind(modules, _window);
        }
    }

    return {
        init: bootstrap,
        // testing purpouses
        modules: modules
    };
});

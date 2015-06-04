define([], function(){

    return {
        boot: function(el){
            var event = document.createEvent('Event');
            event.initEvent('interactive-loaded', true, true);
            el.dispatchEvent(event);
        }
    };

});

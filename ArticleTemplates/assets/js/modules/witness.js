define([], function () {

    var modules = {
        duplicate: function(){
            var witness = document.getElementsByClassName('witness')[0];

            if(witness){
                document.getElementsByClassName('article__body')[0].insertAdjacentHTML('afterend', '<div class="extras">' + witness.outerHTML + '</div>');
            }
        }
    };

    return {
        duplicate: modules.duplicate,
        modules: modules
    };
});
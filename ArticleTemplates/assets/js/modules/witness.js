define([], function () {

    var modules = {
        duplicate: function(){
            var witness = document.querySelector('.witness');
            if(witness){
                document.querySelector('.article__body').insertAdjacentHTML('afterend', '<div class="extras">' + witness.outerHTML + '</div>');
            }
        }
    };

    return {
        duplicate: modules.duplicate,
        modules: modules
    };
});
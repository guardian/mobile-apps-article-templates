define([], function () {

    var modules = {
        duplicate: function(){
            var witness = document.querySelector('.witness');
            if(witness){
                document.querySelector('.article__body').insertAdjacentHTML('afterend', witness.outerHTML);
            }
        }
    };

    return {
        duplicate: modules.duplicate,
        modules: modules
    };
});
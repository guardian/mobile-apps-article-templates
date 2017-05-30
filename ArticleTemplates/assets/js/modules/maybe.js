define(function () {
    'use strict';


    // data Maybe a = Some a | Nothing
    // map :: a -> b
    //
    function Maybe(val) {
        return val === null || val === undefined ? Nothing : Some(val);
    }

    function Some(val) {
        function filter(p) {
            return p(val) ? obj : Nothing;
        }

        function map(f) {
            return Maybe(f(val));
        }

        function flatMap(f) {
            return f(val);
        }

        function getOrElse() {
            return val;
        }

        function equals(m2) {
            return !(m2.filter(function (val2) {
                return val === val2;
            }) === Nothing);
        }

        var obj = Object.freeze({
            filter: filter,
            map: map,
            flatMap: flatMap,
            equals: equals,
            getOrElse: getOrElse
        });

        return obj;
    }

    function returnNothing() {
        return Nothing;
    }

    var Nothing = Object.freeze({
        filter: returnNothing,
        map: returnNothing,
        flatMap: returnNothing,
        equals: function() {
            return false;
        },
        getOrElse: function(val) {
            return val;
        }
    });

    return {
        from: Maybe,
        Some: Some,
        Nothing: Nothing
    };
});

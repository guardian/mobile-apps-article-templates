define([
    'modules/maybe'
], function (Maybe) {
    'use strict';

    var fontNameMap = {
        'Guardian Egyptian Web'      : 'Guardian Egyptian Web',
        'Guardian Text Egyptian Web' : 'Guardian Text Egyptian Web',
        'Guardian Sans Web'          : 'Guardian Agate Sans 1 Web',
        'Guardian Text Sans Web'     : 'Guardian Text Sans Web'
    };

    var fontMap = {
        'Guardian Egyptian Web' : {},
        'Guardian Text Egyptian Web': {},
        'Guardian Sans Web': {},
        'Guardian Text Sans Web': {}
    };

    return {
        init: function(register) {
          // let's build a map of available fonts
          var fss = getFontsStylesheet();
          if (!fss) {
              return;
          }

          buildFontMap(fss);

          // Incoming messages must be [FontDescription] where
          // type FontDescription = { name: string, weight?: FontWeight, style?: FontStyle }
          // type FontWeight = 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
          // type FontStyle = 'normal' | 'italic'
          register('get-webfonts', function(specs) {
              return getWebfonts(specs);
          });
        }
    };

    function getWebfonts(specs) {
        return specs.map(function (fontDescription) {
            var fontName = fontNameMap[fontDescription.family];
            return getFont(
                fontName,
                fontDescription.weight || 'regular',
                fontDescription.style || 'normal'
            );
        });
    }

    function getFontsStylesheet() {
        var i = -1, ii = document.styleSheets.length;
        var fileRX = /fonts-(ios|android|windows)\.css$/;
        while (++i < ii) {
            var s = document.styleSheets[i];
            if (fileRX.test(s.href)) {
                return s;
            }
        }
    }

    function buildFontMap(stylesheet) {
        var i = -1, ii = stylesheet.cssRules.length;
        var base64RX = /^url\(data:.+\)$/;
        var a = document.createElement('a');
        while (++i < ii) {
            var rule = stylesheet.cssRules[i];
            if (!(rule instanceof CSSFontFaceRule)) {
                continue;
            }
            var fileSrc = rule.style.src;
            var family = normaliseFamily(rule.style.fontFamily.replace(/"/g, ''));
            if (! family || ! (family in fontMap)) {
                continue;
            }
            var weight = normaliseWeight(rule.style.fontWeight);
            var style = normaliseStyle(rule.style.fontStyle);
            fontMap[family][weight] || (fontMap[family][weight] = {});
            if (base64RX.test(fileSrc)) {
                fontMap[family][weight][style] = fileSrc.substring(4, fileSrc.length - 1);
            } else {
                fileSrc = fileSrc.substring(5, fileSrc.length - 2);
                a.setAttribute('href', fileSrc);
                fontMap[family][weight][style] = a.href;
            }
        }
    }

    function getFont(name, weight, style) {
        return Maybe.from(fontMap[name])
          .flatMap(function (x) { return Maybe.from(x[weight]); })
          .flatMap(function (x) { return Maybe.from(x[style]); })
          .map(function (x) { return {
            family: name,
            weight: weight,
            style: style,
            url: x
          }})
          .getOrElse({});
    }

    function normaliseFamily(family) {
        return family in fontNameMap ? fontNameMap[family] :
               Object.keys(fontNameMap).reduce(function (res, f) {
                  return f === family || fontNameMap[f] === family ?
                      f : res;
               }, null);
    }

    function normaliseWeight(weight) {
        return weight === '100'      ? 'thin'       :
               weight === '200'      ? 'light'      :
               weight === '300'      ? 'regular'    :
               weight === '400'      ? 'regular'    :
               weight === '500'      ? 'medium'     :
               weight === '600'      ? 'semibold'   :
               weight === '700'      ? 'bold'       :
               weight === '800'      ? 'bold'       :
               weight === '900'      ? 'bold'       :
               weight === 'thin'     ? 'thin'       :
               weight === 'light'    ? 'light'      :
               weight === 'normal'   ? 'regular'    :
               weight === 'medium'   ? 'medium'     :
               weight === 'semibold' ? 'semibold'   :
               weight === 'bold'     ? 'bold'       : 'regular';
    }

    function normaliseStyle(style) {
        return style === 'normal'  ? 'normal'  :
               style === 'italic'  ? 'italic'  :
               style === 'oblique' ? 'italic'  : 'normal';
    }
});

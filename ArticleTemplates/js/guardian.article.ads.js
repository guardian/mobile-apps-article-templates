if (adsEnabled) {
    if (window.innerWidth > 450) {
    $(".article__body > p:nth-of-type(1)").before("<div id='advert-mpu'><div class='advert-label'>Advertisement <div class='icon-container' onclick='javascript:window.location.href=&quot;x-gu://subscribe&quot;'><div class='icon-circle icon-circle-secondary'><span class='icon'>&#xe040;</span></div></div></div><div class='advert-wrapper'><div id='advert-mpu-content'><script type='text/javascript'>googletag.cmd.push(function() { googletag.display('advert-mpu-content'); });</script></div></div></div>");
    }
    if (window.innerWidth <= 450) {
    $(".article__body > p:nth-of-type(6)").after("<div id='advert-mobile-mpu'><div class='advert-label'>Advertisement <div class='icon-container' onclick='javascript:window.location.href=&quot;x-gu://subscribe&quot;'><div class='icon-circle icon-circle-secondary'><span class='icon'>&#xe040;</span></div></div></div><div class='advert-wrapper'><div id='advert-mobile-mpu-content'><script type='text/javascript'>googletag.cmd.push(function() { googletag.display('advert-mobile-mpu-content'); });</script></div></div></div>");

    $("body").prepend("<div id='advert-banner'><div class='advert-label'>Advertisement </div><div class='advert-wrapper'><div id='advert-banner-content'><script type='text/javascript'>googletag.cmd.push(function() { googletag.display('advert-banner-content'); });</script></div></div></div>");
    }
}
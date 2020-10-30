function init() {
    try {
        const showAdFreeTaster = window.GU.opts.showAdFreeTaster;
        setInterval(() => {
            console.log("showAdFreeTaster-------------------")
            console.log(showAdFreeTaster);
        }, 1000)
        if (!showAdFreeTaster) {
            return;
        }

        const afterParagraphs = 3;
        const placeholder = document.createElement('div');
        const adFreeTasterSibling = document.querySelector(`.article__body > div.prose > p:nth-of-type(${afterParagraphs}) ~ p + p`);

        if (!(adFreeTasterSibling && adFreeTasterSibling.parentNode)) {
            // Not enough paragraphs on page to add adFree taster
            return;
        }

        setInterval(() => {
            console.log("adFreeTasterSibling-------------------")
            console.log(adFreeTasterSibling);
        }, 1000)
        
        placeholder.classList.add('ad-free-taster');
        adFreeTasterSibling.parentNode.insertBefore(placeholder, adFreeTasterSibling);

    } catch (e) {

    }
}

export { init };

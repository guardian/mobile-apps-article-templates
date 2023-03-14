function init() {
    let i;
    var tabs = document.getElementsByClassName("tabButton");

    if (tabs) {
        for (i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener(
                "click",
                handleTabClick.bind(null, tabs[i])
            );
        }
    }
    document
        .querySelector(".share-link")
        .addEventListener("click", onShare.bind(null));
}

function handleTabClick(tab, evt) {
    const messageUs = document.querySelector(".messageTabBody");
    const form = document.querySelector(".formTabBody");
    const formTab = document.querySelector(".tabButtonTell");
    const messageTab = document.querySelector(".tabButtonMessage");

    messageUs.style.display = "flex";
    if (evt.target.id === "messageTab") {
        //set active tab color
        tab.style.backgroundColor = "#F6F6F6";

        // set inactive tab color
        formTab.style.backgroundColor = "#DCDCDC";
        //show line
        formTab.style.borderBottom = "1px solid #999999";

        //remove line from active tab
        messageTab.style.borderBottomWidth = "0px";

        //display body of active tab
        messageUs.style.display = "flex";

        // hide body of inactive tab
        form.style.display = "none";
    } else {
        //set active tab color
        tab.style.backgroundColor = "#F6F6F6";

        // set inactive tab color
        messageTab.style.backgroundColor = "#DCDCDC";

        //show line
        messageTab.style.borderBottom = "1px solid #999999";

        //remove line from active tab
        formTab.style.borderBottomWidth = "0px";

        //display body of active tab
        form.style.display = "block";

        // hide body of inactive tab
        messageUs.style.display = "none";
    }
}

const onShare = async () => {
    const url = window.location.href;
    console.log("url", url);
    const title = document.querySelector(".titleStyling").innerHTML;
    const formId = document.querySelector(".formId").value;

    if ("share" in navigator) {
        const shareTitle = `Share your experience: ${title.innerHTML}`;

        const shareText = `
        I saw this callout in an article: ${url}#${formId}
        You can share your story by using the form on this article, or by contacting the Guardian on WhatsApp, Signal or Telegram.`;

        await navigator.share({
            title: shareTitle,
            text: shareText,
        });
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
    } else if ("clipboard" in navigator) {
        await navigator.clipboard.writeText(`${url}#${formId}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
    }
};

export { init };

function init() {
    if (GU.opts.myGuardianEnabled) {
        const followButtons = document.querySelectorAll('.my-guardian-follow-tag');
        followButtons.forEach((followButton) => {
            followButton.style.display = 'block';
        });
    }
}

export { init };

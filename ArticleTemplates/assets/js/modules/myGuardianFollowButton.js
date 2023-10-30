function init() {
    if (GU.opts.myGuardianEnabled) {
        const followButton = document.getElementById('my-guardian-follow-tag');
        followButton.classList.add('myGuardianEnabled');
    }
}

export { init };

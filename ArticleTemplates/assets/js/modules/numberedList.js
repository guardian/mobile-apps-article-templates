// import { getElementOffset, debounce } from 'modules/util';

function addStarClassToRatings() {

    const pElAll = document.querySelectorAll('.prose > p');
    pElAll.forEach((el) => {
        if (el.innerText.indexOf('★') >= 0) {
            el.classList.add('stars');
        }
    })

}

function addStyledLinkAtSectionEnd() {

    const allTheSingleLIs = document.querySelectorAll('ul > li:only-child');
    allTheSingleLIs.forEach((el) => {
        el.parentElement.classList.add('article-link');
    });

}

function addFalseH3() {

    const allFalseH3Candidates = document.querySelectorAll(".prose > p");
    allFalseH3Candidates.forEach((el) => {
        const elStrongText = Array.from(el.children).filter((child) => {
            return (child.tagName == 'STRONG');
        }).map((strongChild) => {
            return strongChild.innerText;
        }).join('');

        if (elStrongText == el.innerText) {
            el.classList.add('falseH3');
        }
    });

}


function formatNumberedList() {

    // Adds yellow styling to star ratings mid article
    addStarClassToRatings();

    // Styled link/section end
    addStyledLinkAtSectionEnd();

    // Faux h3 headings
    // for second level of heading hierarchy in numbered list articles
    addFalseH3();

}

function init() {
    formatNumberedList();
}

export { init };

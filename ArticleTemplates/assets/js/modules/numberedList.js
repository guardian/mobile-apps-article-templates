// import { getElementOffset, debounce } from 'modules/util';

function addStarClassToRatings() {
    console.log('addStarClassToRatings');

    // Frontend equivalent for reference:
    // document.select("p:containsOwn(★)").asScala.foreach { star =>
    //     star.addClass("stars")
    //   }

}

function addStyledLinkAtSectionEnd() {

    const allTheSingleLIs = document.querySelectorAll('ul > li:only-child');
    allTheSingleLIs.forEach((el) => {
        el.parentElement.classList.add('article-link');
    });

}

function addFalseH3() {
    console.log('addFalseH3');

    // Frontend equivalent for reference:
    // document.select("p > strong").asScala.foreach{ strong =>
    //     val p = strong.parent();
    //     if (p.is("p:matchesOwn(^$)") && !p.children().is("a")) {
    //       p.addClass("falseH3")
    //     }
    //   }

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

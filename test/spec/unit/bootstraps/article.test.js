import { init } from 'bootstraps/article';
import { init as twitterInit } from 'modules/twitter';
import { init as quizInit } from 'modules/quiz';
import { init as immersiveInit } from 'modules/immersive';
import { init as creativeInjectorInit } from 'modules/creativeInjector';

jest.mock('modules/twitter');
jest.mock('modules/youtube');
jest.mock('modules/immersive');
jest.mock('modules/quiz');
jest.mock('modules/creativeInjector');

describe('ArticleTemplates/assets/js/bootstraps/article', function () {
    beforeEach(() => {
        window.applyNativeFunctionCall = jest.fn();
    });

    afterEach(() => {
        delete window.applyNativeFunctionCall;
        delete window.GU;
    });

    it('initialises modules', function () {
        init();

        expect(twitterInit).toHaveBeenCalledTimes(1);
        expect(quizInit).toHaveBeenCalledTimes(1);
        expect(immersiveInit).toHaveBeenCalledTimes(1);
        expect(creativeInjectorInit).toHaveBeenCalledTimes(1);
    });
});
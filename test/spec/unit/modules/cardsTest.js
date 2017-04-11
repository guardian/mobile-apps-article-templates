define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/cards', function () {
        var cards,
            container,
            sandbox;

        var destroySpy,
            utilMock,
            flipSnapMock;

        beforeEach(function (done) {
            var injector = new Squire();
            
            sandbox = sinon.sandbox.create();

            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);
            
            window.applyNativeFunctionCall = sandbox.spy();

            window.GU = {
                opts: {}
            };

            window.GuardianJSInterface = {
                registerRelatedCardsTouch: sandbox.spy()
            };

            destroySpy = sandbox.spy();

            utilMock = {
                debounce: function (fn) {
                    return fn;
                }
            };
            flipSnapMock = sandbox.stub().returns({
                destroy: destroySpy
            });

            injector
                .mock('flipSnap', flipSnapMock)
                .mock('modules/util', utilMock)
                .require(['ArticleTemplates/assets/js/modules/cards'], function(sut) {
                    cards = sut;

                    done();
                });
        });

        afterEach(function () {
            document.body.removeChild(container);

            delete window.articleCardsInserter;
            delete window.articleCardsFailed;
            delete window.applyNativeFunctionCall;
            delete window.GU;
            delete window.GuardianJSInterface;

            sandbox.restore();
        });

        describe('init()', function () {
            it('sets up global functions', function () {
                cards.init();

                expect(window.articleCardsInserter).to.not.be.undefined;
                expect(window.articleCardsFailed).to.not.be.undefined;

                expect(window.applyNativeFunctionCall).to.have.been.calledWith('articleCardsInserter');
                expect(window.applyNativeFunctionCall).to.have.been.calledWith('articleCardsFailed');
            });
        });

        describe('window.articleCardsInserter(html)', function() {
            var html,
                relatedContent,
                resizeHandler;

            beforeEach(function () {
                relatedContent = document.createElement('section');
                relatedContent.classList.add('related-content');
                relatedContent.innerHTML = '<div class="related-content__wrapper"></div>';

                container.appendChild(relatedContent);

                html = '<ul class="related-content__list" style="width:600px">' +
                        '<li class="related-content__card"></li>' +
                        '<li class="related-content__card"></li>' +
                        '</ul>';

                sandbox.stub(window, 'addEventListener', function (event, handler) {
                    if (event === 'resize') {
                        resizeHandler = handler;
                    }
                });
            });

            it('adds errror if no html passed', function () {
                cards.init();

                window.articleCardsInserter();

                expect(relatedContent.classList.contains('related-content--has-failed')).to.eql(true);
            });

            it('adds html to relatedContent if html passed', function () {
                cards.init();

                window.articleCardsInserter(html);

                expect(relatedContent.getElementsByClassName('related-content__card').length).to.equal(2);
            });

            it('sets up flipSnap if list width is greater than wrapper width', function () {
                var relatedContentWrapper = relatedContent.getElementsByClassName('related-content__wrapper')[0],
                    relatedContentList;

                relatedContentWrapper.style.width = '300px';

                cards.init();

                window.articleCardsInserter(html);

                relatedContentList = relatedContent.getElementsByClassName('related-content__list')[0];

                expect(relatedContentList.classList.contains('related-content__list--items-2')).to.eql(true);
                expect(flipSnapMock).to.have.been.calledOnce;
                expect(flipSnapMock).to.have.been.calledWith(relatedContentList);
            });

            it('does not set up flipSnap if list width is less than wrapper width', function () {
                var relatedContentList;

                cards.init();

                window.articleCardsInserter(html);

                relatedContentList = relatedContent.getElementsByClassName('related-content__list')[0];

                expect(relatedContentList.classList.contains('related-content__list--items-2')).to.eql(true);
                expect(flipSnapMock).not.to.have.been.called;
            });

            it('if android handles touchstart on relatedContentList', function () {
                var relatedContentWrapper = relatedContent.getElementsByClassName('related-content__wrapper')[0],
                    relatedContentList,
                    touchstartEvt = document.createEvent('HTMLEvents');

                window.GU.opts.platform = 'android';

                relatedContentWrapper.style.width = '300px';

                cards.init();

                window.articleCardsInserter(html);

                relatedContentList = relatedContent.getElementsByClassName('related-content__list')[0];

                touchstartEvt.initEvent('touchstart', true, true);
                
                relatedContentList.dispatchEvent(touchstartEvt);

                expect(window.GuardianJSInterface.registerRelatedCardsTouch).to.have.been.called;
                expect(window.GuardianJSInterface.registerRelatedCardsTouch).to.have.been.calledWith(true); 
            });

            it('if android handles touchend on relatedContentList', function () {
                var relatedContentWrapper = relatedContent.getElementsByClassName('related-content__wrapper')[0],
                    relatedContentList,
                    touchendEvt = document.createEvent('HTMLEvents');

                window.GU.opts.platform = 'android';

                relatedContentWrapper.style.width = '300px';

                cards.init();

                window.articleCardsInserter(html);

                relatedContentList = relatedContent.getElementsByClassName('related-content__list')[0];

                touchendEvt.initEvent('touchend', true, true);
                
                relatedContentList.dispatchEvent(touchendEvt);

                expect(window.GuardianJSInterface.registerRelatedCardsTouch).to.have.been.called;
                expect(window.GuardianJSInterface.registerRelatedCardsTouch).to.have.been.calledWith(false);                        
            });

            it('it handles resize of window and destroys flipSnap', function () {
                var relatedContentList,
                    relatedContentWrapper = relatedContent.getElementsByClassName('related-content__wrapper')[0];

                relatedContentWrapper.style.width = '300px';

                cards.init();

                window.articleCardsInserter(html);

                relatedContentList = relatedContent.getElementsByClassName('related-content__list')[0];

                expect(window.addEventListener).to.have.been.calledOnce;
                expect(window.addEventListener).to.have.been.calledWith('resize');

                expect(flipSnapMock).to.have.been.calledOnce;
                expect(flipSnapMock).to.have.been.calledWith(relatedContentList);

                resizeHandler(relatedContentList);

                expect(destroySpy).to.have.been.calledOnce;
            });
        });
    });
});
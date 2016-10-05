define([
    'modules/util',
    'squire'
], function(
    util,
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/cards', function() {
        var container,
            sandbox,
            injector;

        var destroySpy,
            flipSnapMock;

        beforeEach(function() {
            container = document.createElement('div');
            
            container.id = 'container';
            
            document.body.appendChild(container);
            
            injector = new Squire();
            
            sandbox = sinon.sandbox.create();
            
            window.applyNativeFunctionCall = sinon.spy();

            window.GU = {};

            window.GuardianJSInterface = {
                registerRelatedCardsTouch: sinon.spy()
            };

            util.init();

            sandbox.stub(GU.util, 'debounce', function(func) {
                return func;
            });

            destroySpy = sinon.spy();
            
            flipSnapMock = sinon.stub().returns({
                destroy: destroySpy
            });
        });

        afterEach(function() {
            document.body.removeChild(container);

            delete window.articleCardsInserter;
            delete window.articleCardsFailed;
            delete window.applyNativeFunctionCall;
            delete window.GU;
            delete window.GuardianJSInterface;

            sandbox.restore();
        });

        it('sets up global functions', function(done) {
            injector
                .mock('flipSnap', flipSnapMock)
                .require(['ArticleTemplates/assets/js/modules/cards'], function(cards) {
                    cards.init();

                    expect(window.articleCardsInserter).to.not.be.undefined;
                    expect(window.articleCardsFailed).to.not.be.undefined;

                    expect(window.applyNativeFunctionCall).to.have.been.calledWith('articleCardsInserter');
                    expect(window.applyNativeFunctionCall).to.have.been.calledWith('articleCardsFailed');

                    done();
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

            it('adds errror if no html passed', function(done) {
                injector
                    .mock('flipSnap', flipSnapMock)
                    .require(['ArticleTemplates/assets/js/modules/cards'], function(cards) {
                        cards.init();

                        window.articleCardsInserter();

                        expect(relatedContent.classList.contains('related-content--has-failed')).to.eql(true);

                        done();
                    });
            });

            it('adds html to relatedContent if html passed', function(done) {
                injector
                    .mock('flipSnap', flipSnapMock)
                    .require(['ArticleTemplates/assets/js/modules/cards'], function(cards) {
                        cards.init();

                        window.articleCardsInserter(html);

                        expect(relatedContent.getElementsByClassName('related-content__card').length).to.equal(2);

                        done();
                    });
            });

            it('sets up flipSnap if list width is greater than wrapper width', function(done) {
                injector
                    .mock('flipSnap', flipSnapMock)
                    .require(['ArticleTemplates/assets/js/modules/cards'], function(cards) {
                        var relatedContentWrapper = relatedContent.getElementsByClassName('related-content__wrapper')[0],
                            relatedContentList;

                        relatedContentWrapper.style.width = '300px';

                        cards.init();

                        window.articleCardsInserter(html);

                        relatedContentList = relatedContent.getElementsByClassName('related-content__list')[0];

                        expect(relatedContentList.classList.contains('related-content__list--items-2')).to.eql(true);
                        expect(flipSnapMock).to.have.been.calledOnce;
                        expect(flipSnapMock).to.have.been.calledWith(relatedContentList);

                        done();
                    });
            });

            it('does not set up flipSnap if list width is less than wrapper width', function(done) {
                injector
                    .mock('flipSnap', flipSnapMock)
                    .require(['ArticleTemplates/assets/js/modules/cards'], function(cards) {
                        var relatedContentList;

                        cards.init();

                        window.articleCardsInserter(html);

                        relatedContentList = relatedContent.getElementsByClassName('related-content__list')[0];

                        expect(relatedContentList.classList.contains('related-content__list--items-2')).to.eql(true);
                        expect(flipSnapMock).not.to.have.been.called;
                        done();
                    });
            });

            it('if android handles touchstart on relatedContentList', function(done) {
                injector
                    .mock('flipSnap', flipSnapMock)
                    .require(['ArticleTemplates/assets/js/modules/cards'], function(cards) {
                        var relatedContentWrapper = relatedContent.getElementsByClassName('related-content__wrapper')[0],
                            relatedContentList,
                            touchstartEvt = document.createEvent('HTMLEvents');

                        document.body.classList.add('android');

                        relatedContentWrapper.style.width = '300px';

                        cards.init();

                        window.articleCardsInserter(html);

                        relatedContentList = relatedContent.getElementsByClassName('related-content__list')[0];

                        touchstartEvt.initEvent('touchstart', true, true);
                        
                        relatedContentList.dispatchEvent(touchstartEvt);

                        expect(window.GuardianJSInterface.registerRelatedCardsTouch).to.have.been.called;
                        expect(window.GuardianJSInterface.registerRelatedCardsTouch).to.have.been.calledWith(true);                        

                        document.body.classList.remove('android');

                        done();
                    });
            });

            it('if android handles touchend on relatedContentList', function(done) {
                injector
                    .mock('flipSnap', flipSnapMock)
                    .require(['ArticleTemplates/assets/js/modules/cards'], function(cards) {
                        var relatedContentWrapper = relatedContent.getElementsByClassName('related-content__wrapper')[0],
                            relatedContentList,
                            touchendEvt = document.createEvent('HTMLEvents');

                        document.body.classList.add('android');

                        relatedContentWrapper.style.width = '300px';

                        cards.init();

                        window.articleCardsInserter(html);

                        relatedContentList = relatedContent.getElementsByClassName('related-content__list')[0];

                        touchendEvt.initEvent('touchend', true, true);
                        
                        relatedContentList.dispatchEvent(touchendEvt);

                        expect(window.GuardianJSInterface.registerRelatedCardsTouch).to.have.been.called;
                        expect(window.GuardianJSInterface.registerRelatedCardsTouch).to.have.been.calledWith(false);                        

                        document.body.classList.remove('android');

                        done();
                    });
            });

            it('it handles resize of window and destroys flipSnap', function(done) {
                injector
                    .mock('flipSnap', flipSnapMock)
                    .require(['ArticleTemplates/assets/js/modules/cards'], function(cards) {
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

                        done();
                    });
            });
        });
    });
});
define([
    'squire'
], function(
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/relativeDates', function() {
        var relativeDates,
            clock,
            now = new Date('2016-06-28T22:00:00Z');

        beforeEach(function (done) {
            var injector = new Squire();

            injector
                .require(['ArticleTemplates/assets/js/modules/relativeDates'], function (sut) {
                    relativeDates = sut;

                    done();
                });
        });

        describe('replace valid timestamps', function() {
            var tests = [{
                description: 'when input time less than a minutes ago',
                dateTime: '2016-06-28T21:59:30Z',
                assertion: '30s'
            }, {
                description: 'when input time 1 minute ago',
                dateTime: '2016-06-28T21:59:00Z',
                assertion: 'Now'
            }, {
                description: 'when input time 2 minutes ago',
                dateTime: '2016-06-28T21:58:00Z',
                assertion: '2m ago'
            }, {
                description: 'when input time 2 hours ago',
                dateTime: '2016-06-28T20:00:00Z',
                assertion: '2h ago'
            }, {
                description: 'when input time 2 days ago',
                dateTime: '2016-06-26T22:00:00Z',
                assertion: '2d ago'
            }, {
                description: 'when input time 2 weeks ago',
                dateTime: '2016-06-14T22:00:00Z',
                assertion: '2w ago'
            }, {
                description: 'when input time 2 years ago',
                dateTime: '2014-06-28T22:00:00Z',
                assertion: '2y ago'
            }, {
                description: 'when input time previous day',
                dateTime: '2016-06-27T23:00:00Z',
                assertion: '23h ago'
            }];

            describe('when elems has no child with class timestamp__text', function() {
                tests.forEach(function (test) {
                    it(test.description, function () {
                        var timeElem = document.createElement('div');

                        timeElem.classList.add('block__time');
                        timeElem.setAttribute('title', test.dateTime);

                        document.body.appendChild(timeElem);

                        clock = sinon.useFakeTimers(now.getTime());

                        relativeDates.init('.block__time', 'title');

                        expect(timeElem.innerHTML).to.eql(test.assertion);

                        clock.restore();

                        document.body.removeChild(timeElem);
                    });
                });
            });

            describe('when elem has child with class timestamp__text', function() {
                tests.forEach(function(test) {
                    it(test.description, function () {
                        var timeElem = document.createElement('div'),
                            timeStampElem = document.createElement('div');

                        timeElem.classList.add('block__time');
                        timeElem.setAttribute('title', test.dateTime);
                        timeStampElem.classList.add('timestamp__text');
                        timeStampElem.innerText = 'hello world';

                        timeElem.appendChild(timeStampElem);

                        document.body.appendChild(timeElem);

                        clock = sinon.useFakeTimers(now.getTime());

                        relativeDates.init('.block__time', 'title');

                        expect(timeStampElem.innerHTML).to.eql(test.assertion);
                        expect(timeStampElem.getAttribute('title')).to.eql('hello world');

                        clock.restore();

                        document.body.removeChild(timeElem);
                    });
                });
            });
        });

        it('should do nothing if input time is in the future', function () {
            var timeElem = document.createElement('div');

            timeElem.classList.add('block__time');
            timeElem.setAttribute('title', '2016-06-28T23:00:00Z');
            timeElem.innerHTML = 'hello world';

            document.body.appendChild(timeElem);

            clock = sinon.useFakeTimers(now.getTime());

            relativeDates.init('.block__time', 'title');

            expect(timeElem.innerHTML).to.eql('hello world');

            clock.restore();

            document.body.removeChild(timeElem);
        });

        it('should do nothing if input time is invalid', function () {
            var timeElem = document.createElement('div');

            timeElem.classList.add('block__time');
            timeElem.setAttribute('title', '');
            timeElem.innerHTML = 'hello world';

            document.body.appendChild(timeElem);

            clock = sinon.useFakeTimers(now.getTime());

            relativeDates.init('.block__time', 'title');

            expect(timeElem.innerHTML).to.eql('hello world');

            clock.restore();

            document.body.removeChild(timeElem);
        });
    });
});
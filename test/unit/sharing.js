define([
    'modules/sharing',
    'bonzo',
    'bean',
    'modules/$'
], function(Sharing, bonzo, bean, $){

    describe('Sharing', function(){
        var sandbox;

        before(function(){
            sandbox = bonzo(bonzo.create('<div id="sandbox" style="visibility:hidden;"></div>'));
            sandbox.appendTo(document.body);
        });

        it('exists', function(){
            expect(Sharing).to.be.defined;
        });

        it('does not exposes two functions if the system is Android', function(){
            var _window = {};
            Sharing.init(_window);
            expect(_window.nativeSharing).to.be.undefined;
        });

        describe('on ios', function(){
            var _window;

            beforeEach(function(){
                _window = {location: {}};
                $('body').addClass('ios');
                Sharing.init(_window);
            });

            it('exposes two functions if the system is iOs', function(){
                expect(typeof(_window.nativeSharing)).to.be.equal('function');
            });

            it('generates the right x-gu sharing URL for facebook', function(){
                _window.nativeSharing('facebook','www.google.com', 'sharing with facebook');
                expect(_window.location.href).to.be.equal('x-gu://facebookshare/?url=' +
                    encodeURIComponent('www.google.com') + "&title=" +
                    encodeURIComponent('sharing with facebook')
                );
            });

            it('generates the right x-gu sharing URL for twitter', function(){
                _window.nativeSharing('twitter','www.google.com', 'sharing with twitter');
                expect(_window.location.href).to.be.equal('x-gu://twittershare/?url=' +
                    encodeURIComponent('www.google.com') + "&title=" +
                    encodeURIComponent('sharing with twitter')
                );
            });

            it('works without title', function(){
                _window.nativeSharing('twitter','www.google.com');
                expect(_window.location.href).to.be.equal('x-gu://twittershare/?url=' +
                    encodeURIComponent('www.google.com')
                );
            });

            afterEach(function(){
                $('body').removeClass('ios');
            });

        });

        afterEach(function(){
            sandbox.empty();
        });

        after(function(){
            sandbox.remove();
        });

    });

});
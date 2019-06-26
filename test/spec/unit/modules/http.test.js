import { init, POST } from 'modules/http';
import * as util from 'modules/util';

describe('ArticleTemplates/assets/js/modules/http', function () {
    describe('POST', function () {
        beforeEach(() => {
            init();
        });

        it('returns without named functions', function () {
            expect(window.httpCallbacks).toBeDefined();
            POST("https://mobile.guardianapis.com",
                () => {},
                () => {},
                "")
            expect(window.httpCallbacks).toEqual({})
        });

        it('returns without error and success callbacks', function () {
            expect(window.httpCallbacks).toBeDefined();
            POST("https://mobile.guardianapis.com", null, null, "")
            expect(window.httpCallbacks).toEqual({})
        });

        it('sets callbacks correctly on window object', function () {
            expect(window.httpCallbacks).toBeDefined();
            const success = () => {}
            const error = () => {}
            POST("https://mobile.guardianapis.com", success, error, "")
            expect(window.httpCallbacks.error).toEqual(expect.any(Function))
            expect(window.httpCallbacks.success).toEqual(expect.any(Function))
        });

        it('calls signal device with the correct formatted string', function () {
            const success = () => {}
            const error = () => {}
            const signalDeviceMock = jest.spyOn(util, "signalDevice");
            POST("https://mobile.guardianapis.com", success, error, '{ field: "value" }')
            expect(signalDeviceMock).toHaveBeenCalled();
            expect(signalDeviceMock).toHaveBeenCalledWith("POST/https%3A%2F%2Fmobile.guardianapis.com?data=%7B%20field%3A%20%22value%22%20%7D&successCallback=window.httpCallbacks['success']&errorCallback=window.httpCallbacks['error']");
        });
    });
});
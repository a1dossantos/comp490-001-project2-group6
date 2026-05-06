import { expect } from 'chai';
import sinon from 'sinon';
import { SettingsFileView } from 'views/settings/settings-file-view';
import QRCode from 'qrcode/lib/browser.js';
import { FileSaver } from 'util/ui/file-saver';
import { Alerts } from 'comp/ui/alerts';

describe('SettingsFileView - saveQrCode', () => {
    let view;
    let mockModel;
    const stubs = {};

    beforeEach(() => {
        // Set up a mock database model with necessary properties for the view
        mockModel = {
            name: 'MyVault',
            on: sinon.stub(),
            listenTo: sinon.stub()
        };

        /**
         * PREVENT SIDE EFFECTS:
         * The constructor of SettingsFileView automatically calls these methods.
         * We stub them to prevent DOM manipulation or USB hardware access during testing.
         */
        sinon.stub(SettingsFileView.prototype, 'refreshYubiKeys');
        sinon.stub(SettingsFileView.prototype, 'renderKeyFileSelect');

        view = new SettingsFileView(mockModel);

        // Stub external dependencies to track calls and control return values
        stubs.toDataURL = sinon.stub(QRCode, 'toDataURL');
        stubs.saveAs = sinon.stub(FileSaver, 'saveAs');
        stubs.alertsError = sinon.stub(Alerts, 'error');

        /**
         * BROWSER COMPATIBILITY:
         * SettingsFileView uses 'Buffer' to decode base64 strings into binary.
         * Standard browsers don't have Buffer, so we polyfill it here to simulate the
         * environment the app expects (likely Electron or a bundled environment).
         */
        if (typeof Buffer === 'undefined') {
            global.Buffer = {
                from: (str) =>
                    new Uint8Array(
                        atob(str)
                            .split('')
                            .map((c) => c.charCodeAt(0))
                    )
            };
        }
    });

    afterEach(() => {
        // Reset all stubs to avoid state leakage between tests
        sinon.restore();
    });

    /**
     * ASYNC HELPER:
     * saveQrCode uses .then() internally but does not return a promise.
     * This helper flushes the microtask queue, ensuring the test waits for the
     * internal promise chain to complete before running assertions.
     */
    const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

    it('should convert the DataURL to a Blob and save it via FileSaver', async () => {
        // Arrange: Simulate the QRCode library returning a valid base64 image string
        const mockDataUrl = 'data:image/png;base64,VEVTVF9CQVNFNjQ=';
        stubs.toDataURL.resolves(mockDataUrl);

        // Act: Trigger the QR generation logic
        view.saveQrCode('test-key-data');

        // Wait for the internal .then() block to execute
        await waitForAsync();

        // Assert: Verify the QR library was called with correct parameters
        expect(stubs.toDataURL.calledOnce).to.be.true;

        // Assert: Verify FileSaver was triggered with a binary Blob and a filename based on the model name
        expect(stubs.saveAs.calledOnce, 'FileSaver.saveAs was not called').to.be.true;

        const [blob, filename] = stubs.saveAs.firstCall.args;
        expect(filename).to.equal('MyVault-key-qr.png');
        expect(blob).to.be.an.instanceOf(Blob);
    });

    it('should handle QR generation rejection and show an alert', async () => {
        // Arrange: Force the library to fail (e.g., if canvas rendering fails)
        const error = new Error('Canvas failure');
        stubs.toDataURL.rejects(error);

        // Act
        view.saveQrCode('data');

        await waitForAsync();

        // Assert: Verify the UI shows an error message to the user
        expect(stubs.alertsError.calledOnce, 'Alerts.error was not called').to.be.true;
        expect(stubs.alertsError.firstCall.args[0].header).to.equal('QR Error');
        expect(stubs.alertsError.firstCall.args[0].pre).to.equal(error);
    });

    it('should alert an error if the QR library method is missing', () => {
        /**
         * DEFENSIVE CHECK:
         * SettingsFileView has logic to detect if the library failed to load or has a
         * different structure (QRCode vs QRCode.default).
         * We manually break the reference to trigger this fallback.
         */
        const originalToDataURL = QRCode.toDataURL;
        QRCode.toDataURL = undefined;

        // Act
        view.saveQrCode('data');

        // Assert: The app should catch the missing method and notify the user immediately
        expect(stubs.alertsError.calledOnce).to.be.true;
        expect(stubs.alertsError.firstCall.args[0].body).to.equal('QRCode.toDataURL not found');

        // Restore original state
        QRCode.toDataURL = originalToDataURL;
    });
});

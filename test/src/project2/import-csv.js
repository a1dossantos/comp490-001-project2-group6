import { expect } from 'chai';
import sinon from 'sinon';
import { Events } from 'framework/events';
import { ListView } from 'views/list-view';

describe('ListView - importCSV (Simplified)', () => {
    let context;

    beforeEach(() => {
        // Create a plain object to act as 'this' for the function
        context = {};

        // Ensure Events.emit is a stub we can track
        if (!Events.emit.restore) {
            sinon.stub(Events, 'emit');
        } else {
            Events.emit.resetHistory();
        }
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should trigger the file picker and emit an event on file selection', () => {
        // 1. Setup the fake input element
        const mockInput = {
            click: sinon.stub(),
            onchange: null,
            type: '',
            accept: ''
        };

        // 2. Stub document.createElement specifically for this test
        const createElementStub = sinon
            .stub(document, 'createElement')
            .withArgs('input')
            .returns(mockInput);

        // 3. EXECUTE: Call the function directly using our context
        ListView.prototype.importCSV.call(context);

        // 4. ASSERT: Did it create the input correctly?

        // Verify the function created exactly one input.
        expect(createElementStub.calledOnce).to.be.true;

        // Verify the input is configured as a file picker.
        expect(mockInput.type).to.equal('file');

        // Verify the security/format restriction.
        expect(mockInput.accept).to.equal('.csv');

        // Verify the function actually "clicked" the input to show the dialog.
        expect(mockInput.click.calledOnce).to.be.true;

        // 5. SIMULATE: Selection of a file
        const mockFile = { name: 'test-import.csv', size: 1024 };
        const fakeEvent = {
            target: {
                files: [mockFile]
            }
        };

        // Trigger the internal callback
        mockInput.onchange(fakeEvent);

        // 6. ASSERT: Did it signal the rest of the app?
        expect(Events.emit.calledWith('import-csv-requested', mockFile)).to.be.true;
    });
});

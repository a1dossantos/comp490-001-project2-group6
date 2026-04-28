import { expect } from 'chai';
import sinon from 'sinon';
import { AutoType } from 'auto-type/index';

describe('Caps Lock Detection for Auto-Type', () => {
    beforeEach(() => {
        // Reset state before each test
        AutoType.isCaps = false;
        AutoType.enabled = true;

        // Initialize the listeners
        AutoType.init();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should set isCaps to true when CapsLock is active on keydown', () => {
        // Create a fake keyboard event
        const event = new window.KeyboardEvent('keydown');

        // Stub getModifierState to simulate Caps Lock being ON
        sinon.stub(event, 'getModifierState').withArgs('CapsLock').returns(true);

        // Dispatch the event to the window
        window.dispatchEvent(event);

        expect(AutoType.isCaps).to.be.true;
    });

    it('should set isCaps to false when CapsLock is inactive on keydown', () => {
        const event = new window.KeyboardEvent('keydown');

        // Simulate Caps Lock being OFF
        sinon.stub(event, 'getModifierState').withArgs('CapsLock').returns(false);

        window.dispatchEvent(event);

        expect(AutoType.isCaps).to.be.false;
    });

    it('should update state on mousedown (to catch mouse-only transitions)', () => {
        const event = new window.MouseEvent('mousedown');

        // Simulate clicking while Caps Lock is ON
        sinon.stub(event, 'getModifierState').withArgs('CapsLock').returns(true);

        window.dispatchEvent(event);

        expect(AutoType.isCaps).to.be.true;
    });
});

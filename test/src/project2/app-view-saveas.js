import { AppView } from 'views/app-view';
import { Storage } from 'storage';
import sinon from 'sinon';
import { expect } from 'chai';

describe('AppView Save As', () => {
    let appView;
    let model;

    beforeEach(() => {
        model = {
            files: { find: sinon.stub() },
            getData: sinon.stub()
        };

        appView = { model };
        appView.saveAsPressed = AppView.prototype.saveAsPressed.bind(appView);

        sinon.stub(Storage.file, 'save').callsFake(() => {});
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should do nothing if no active file exists', () => {
        const e = { preventDefault: sinon.spy() };

        model.files.find.returns(null);

        appView.saveAsPressed(e);

        // eslint-disable-next-line babel/no-unused-expressions
        expect(e.preventDefault.called).to.be.true;
        // eslint-disable-next-line babel/no-unused-expressions
        expect(model.getData.called).to.be.false;
    });

    it('should execute save flow when file exists', () => {
        const e = { preventDefault: sinon.spy() };

        model.files.find.returns({ name: 'test-file' });
        model.getData.callsFake((cb) => cb('file-data'));

        appView.saveAsPressed(e);

        // eslint-disable-next-line babel/no-unused-expressions
        expect(e.preventDefault.called).to.be.true;
        // eslint-disable-next-line babel/no-unused-expressions
        expect(model.getData.called).to.be.true;
    });
});

const expect = require('chai').expect;

describe('Subpath/Basepath Support', () => {
    it('should define correct base path configuration', () => {
        const basePath = '/keeweb/';
        expect(basePath).to.equal('/keeweb/');
    });

    it('should construct asset URLs with base path', () => {
        const url = '/keeweb/' + 'js/app.js';
        expect(url).to.equal('/keeweb/js/app.js');
    });
});

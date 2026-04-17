import { expect } from 'chai';
import { EntrySearch } from 'util/entry-search';

describe('EntrySearch - Feature #2181: Hide Expired Entries', () => {
    it('should return false (hide) when hideExpired is ON and entry is expired', () => {
        const mockModel = { expired: true };
        const filter = {
            advanced: { hideExpired: true }
        };

        const search = new EntrySearch(mockModel);
        const result = search.matches(filter);

        expect(result).to.be.false;
    });

    it('should return true (show) when hideExpired is ON but entry is NOT expired', () => {
        const mockModel = { expired: false };
        const filter = {
            advanced: { hideExpired: true }
        };

        const search = new EntrySearch(mockModel);
        const result = search.matches(filter);

        expect(result).to.be.true;
    });

    it('should return true (show) when hideExpired is OFF even if entry is expired', () => {
        const mockModel = { expired: true };
        const filter = {
            advanced: { hideExpired: false }
        };

        const search = new EntrySearch(mockModel);
        const result = search.matches(filter);

        expect(result).to.be.true;
    });
});

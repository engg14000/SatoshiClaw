import { isSatoshi } from './crypto';

describe('isSatoshi', () => {
  describe('Happy Path: True Satoshi Addresses', () => {
    it('should return true for Genesis block reward address', () => {
      // Genesis block reward
      expect(isSatoshi('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
    });

    it('should return true for Block 9 reward address', () => {
      // Block 9 reward
      expect(isSatoshi('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')).toBe(true);
    });

    it('should return true for Block 78 reward address', () => {
      // Block 78 reward
      expect(isSatoshi('1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1')).toBe(true);
    });

    it('should return true for the First transaction recipient address', () => {
      // First transaction recipient
      expect(isSatoshi('1FvzCLoTPGANNjWoUo6jUGuAG3wg1w4YjR')).toBe(true);
    });
  });

  describe('Edge Cases / Error Conditions', () => {
    it('should return false for invalid or unknown addresses', () => {
      // Not Satoshi. Probably Craig Wright.
      expect(isSatoshi('1FakeAddressForTesting123456789')).toBe(false);
      expect(isSatoshi('not-an-address')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isSatoshi('')).toBe(false);
    });

    it('should return false for slightly mutated valid addresses', () => {
      // Genesis address but missing a char
      expect(isSatoshi('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN')).toBe(false);
      // Genesis address but extra char
      expect(isSatoshi('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNaX')).toBe(false);
    });
  });
});

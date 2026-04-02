import { generateRandomKey, isSatoshi, getProbabilityOfFindingSatoshi } from './crypto';

/**
 * SathoshiClaw Crypto Utils Test Suite
 *
 * We are testing the tools of the trade. If these fail,
 * we're just larping even harder than usual.
 */
describe('Crypto Utilities', () => {

  describe('generateRandomKey', () => {
    it('should generate a valid-looking keypair for our Satoshi hunt', () => {
      const key = generateRandomKey();

      // Check if the structure is correct
      expect(key).toHaveProperty('privateKey');
      expect(key).toHaveProperty('address');
      expect(key).toHaveProperty('wif');

      // Check if they are non-empty strings
      expect(typeof key.privateKey).toBe('string');
      expect(key.privateKey.length).toBeGreaterThan(0);

      expect(typeof key.address).toBe('string');
      expect(key.address.length).toBeGreaterThan(0);

      expect(typeof key.wif).toBe('string');
      expect(key.wif.length).toBeGreaterThan(0);

      // Basic Bitcoin address check (P2PKH addresses start with 1)
      expect(key.address.startsWith('1')).toBe(true);
    });

    it('should generate unique keys (statistically speaking)', () => {
      const key1 = generateRandomKey();
      const key2 = generateRandomKey();

      expect(key1.privateKey).not.toBe(key2.privateKey);
      expect(key1.address).not.toBe(key2.address);
    });
  });

  describe('isSatoshi', () => {
    it('should identify the Genesis block reward address as Satoshi', () => {
      const genesisAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      expect(isSatoshi(genesisAddress)).toBe(true);
    });

    it('should identify the Block 9 reward address as Satoshi', () => {
      const block9Address = '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX';
      expect(isSatoshi(block9Address)).toBe(true);
    });

    it('should return false for a random non-Satoshi address', () => {
      const randomAddress = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
      expect(isSatoshi(randomAddress)).toBe(false);
    });

    it('should return false for empty strings or garbage', () => {
      expect(isSatoshi('')).toBe(false);
      expect(isSatoshi('not-an-address')).toBe(false);
    });
  });

  describe('getProbabilityOfFindingSatoshi', () => {
    it('should return the correct satirical probability string', () => {
      const expected = "1 in 115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457,584,007,913,129,639,936";
      expect(getProbabilityOfFindingSatoshi()).toBe(expected);
    });
  });
});

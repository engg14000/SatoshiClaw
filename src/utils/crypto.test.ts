import { generateRandomKey, isSatoshi, getProbabilityOfFindingSatoshi } from './crypto';

describe('crypto utilities', () => {
  describe('generateRandomKey', () => {
    it('should return a valid key pair object', () => {
      const keyPair = generateRandomKey();

      expect(keyPair).toHaveProperty('privateKey');
      expect(keyPair).toHaveProperty('address');
      expect(keyPair).toHaveProperty('wif');

      expect(typeof keyPair.privateKey).toBe('string');
      expect(typeof keyPair.address).toBe('string');
      expect(typeof keyPair.wif).toBe('string');
    });

    it('should generate a valid looking bitcoin address', () => {
      const keyPair = generateRandomKey();
      // Most P2PKH addresses start with 1 and are 26-35 characters long
      expect(keyPair.address).toMatch(/^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/);
    });

    it('should generate a valid hex private key', () => {
      const keyPair = generateRandomKey();
      // 64 characters hex string
      expect(keyPair.privateKey).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate a valid WIF', () => {
      const keyPair = generateRandomKey();
      // WIF typically starts with 5, K, or L and is ~51-52 chars
      expect(keyPair.wif).toMatch(/^[5KL][a-km-zA-HJ-NP-Z1-9]{50,51}$/);
    });

    it('should generate unique keys on subsequent calls', () => {
      const keyPair1 = generateRandomKey();
      const keyPair2 = generateRandomKey();

      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
      expect(keyPair1.address).not.toBe(keyPair2.address);
      expect(keyPair1.wif).not.toBe(keyPair2.wif);
    });
  });

  describe('isSatoshi', () => {
    it('should return true for known Satoshi addresses', () => {
      expect(isSatoshi('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
      expect(isSatoshi('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')).toBe(true);
    });

    it('should return false for random generated addresses', () => {
      const keyPair = generateRandomKey();
      expect(isSatoshi(keyPair.address)).toBe(false);
    });
  });

  describe('getProbabilityOfFindingSatoshi', () => {
    it('should return a string indicating the probability', () => {
      const prob = getProbabilityOfFindingSatoshi();
      expect(typeof prob).toBe('string');
      expect(prob).toContain('1 in');
    });
  });
});

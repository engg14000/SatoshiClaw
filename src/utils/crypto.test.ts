import { generateRandomKey } from './crypto';
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

const ECPair = ECPairFactory(ecc);

describe('generateRandomKey', () => {
  it('should generate a valid key pair object', () => {
    const keyPair = generateRandomKey();

    expect(keyPair).toHaveProperty('privateKey');
    expect(keyPair).toHaveProperty('address');
    expect(keyPair).toHaveProperty('wif');

    expect(typeof keyPair.privateKey).toBe('string');
    expect(typeof keyPair.address).toBe('string');
    expect(typeof keyPair.wif).toBe('string');
  });

  it('should generate a 64-character hex private key', () => {
    const keyPair = generateRandomKey();
    expect(keyPair.privateKey).toMatch(/^[0-9a-f]{64}$/i);
  });

  it('should generate a valid P2PKH bitcoin address', () => {
    const keyPair = generateRandomKey();
    // P2PKH addresses start with 1 and are 26-35 characters long
    expect(keyPair.address).toMatch(/^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/);

    // Verify it using bitcoinjs-lib to ensure it's actually valid
    expect(() => {
      bitcoin.address.toOutputScript(keyPair.address);
    }).not.toThrow();
  });

  it('should generate a valid WIF (Wallet Import Format)', () => {
    const keyPair = generateRandomKey();

    // WIFs typically start with 5, K, or L for mainnet
    expect(keyPair.wif).toMatch(/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/);

    // Verify WIF using ECPair
    expect(() => {
      ECPair.fromWIF(keyPair.wif);
    }).not.toThrow();
  });

  it('should generate unique keys on subsequent calls', () => {
    const keyPair1 = generateRandomKey();
    const keyPair2 = generateRandomKey();

    expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
    expect(keyPair1.address).not.toBe(keyPair2.address);
    expect(keyPair1.wif).not.toBe(keyPair2.wif);
  });
});

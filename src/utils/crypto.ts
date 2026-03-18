import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { randomBytes } from 'crypto';

const ECPair = ECPairFactory(ecc);

// Known Satoshi Addresses (The Holy Grails)
const SATOSHI_ADDRESSES = [
  '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Genesis block reward
  '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX', // Block 9 reward
  '1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1', // Block 78 reward
  '1FvzCLoTPGANNjWoUo6jUGuAG3wg1w4YjR', // First transaction recipient (Hal Finney received, but maybe Satoshi sent from here?) - No wait, Satoshi sent FROM 12cbQLTFMXRnSzktFkuoG3eKrMeUwV52M
];

// Precompute the RIPEMD-160 hash of the pubkey for known Satoshi addresses
const SATOSHI_HASHES_BUFFER = SATOSHI_ADDRESSES.map(addr => bitcoin.address.fromBase58Check(addr).hash);

export interface KeyPair {
  privateKey: string;
  address: string;
  wif: string;
  pubkeyHash?: Buffer;
}

export function generateRandomKey(): KeyPair {
  const keyPair = ECPair.makeRandom();

  return {
    get privateKey() { return keyPair.privateKey!.toString('hex'); },
    get address() { return bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }).address!; },
    get wif() { return keyPair.toWIF(); },
    pubkeyHash: bitcoin.crypto.hash160(keyPair.publicKey)
  };
}

export function isSatoshi(addressOrKey: string | KeyPair): boolean {
  if (typeof addressOrKey === 'string') {
    return SATOSHI_ADDRESSES.includes(addressOrKey);
  }

  if (addressOrKey.pubkeyHash) {
    const pubkeyHash = addressOrKey.pubkeyHash;
    for (let i = 0; i < SATOSHI_HASHES_BUFFER.length; i++) {
      if (pubkeyHash.equals(SATOSHI_HASHES_BUFFER[i])) return true;
    }
    return false;
  }

  // Fallback if no pubkeyHash
  return SATOSHI_ADDRESSES.includes(addressOrKey.address);
}

// Educational function to explain probability
export function getProbabilityOfFindingSatoshi(): string {
  return "1 in 115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457,584,007,913,129,639,936";
}

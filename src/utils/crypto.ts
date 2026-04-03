import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

const ECPair = ECPairFactory(ecc);

// Known Satoshi Addresses (The Holy Grails)
const SATOSHI_ADDRESSES = new Set([
  '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Genesis block reward
  '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX', // Block 9 reward
  '1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1', // Block 78 reward
  '1FvzCLoTPGANNjWoUo6jUGuAG3wg1w4YjR', // First transaction recipient (Hal Finney received, but maybe Satoshi sent from here?) - No wait, Satoshi sent FROM 12cbQLTFMXRnSzktFkuoG3eKrMeUwV52M
]);

export interface KeyPair {
  privateKey: string;
  address: string;
  wif: string;
}

export function generateRandomKey(): KeyPair {
  const keyPair = ECPair.makeRandom();
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

  return {
    get privateKey() { return keyPair.privateKey!.toString('hex'); },
    address: address!,
    get wif() { return keyPair.toWIF(); },
  };
}

export function isSatoshi(address: string): boolean {
  return SATOSHI_ADDRESSES.has(address);
}

// Educational function to explain probability
export function getProbabilityOfFindingSatoshi(): string {
  return "1 in 115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457,584,007,913,129,639,936";
}

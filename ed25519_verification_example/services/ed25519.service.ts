import * as ed25519 from '@noble/ed25519';
import { Keypair } from '@solana/web3.js';
import { SIGNATURE_BLOCK_SPAN } from './ed25519_instruction.service';

export class Ed25519Service {

  static sign(
    message: Buffer,
    ...signers: Keypair[]
  ): Buffer {

  }
}


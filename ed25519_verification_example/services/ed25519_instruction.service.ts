import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import * as borsh from '@project-serum/borsh';
import {
  AccountMeta,
  Ed25519Program,
  Keypair,
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';
import { BorshService } from '@tforcexyz/solana-support-library';

ed25519.utils.sha512Sync = (...m) => sha512(ed25519.utils.concatBytes(...m));

interface VerifySignaturesRequest {
  numSignatures: number
  padding: number
}

const VERIFY_SIGNATURES_REQUEST_LAYOUT: borsh.Layout<VerifySignaturesRequest> = borsh.struct([
  borsh.u8('numSignatures'),
  borsh.u8('padding'),
]);

interface SignatureOffset {
  signatureOffset: number
  signatureInstructionIndex: number
  publicKeyOffset: number
  publicKeyInstructionIndex: number
  messageDataOffset: number
  messageDataSize: number
  messageInstructionIndex: number
}

const SIGNATURE_OFFSET_LAYOUT: borsh.Layout<SignatureOffset> = borsh.struct([
  borsh.u16('signatureOffset'),
  borsh.u16('signatureInstructionIndex'),
  borsh.u16('publicKeyOffset'),
  borsh.u16('publicKeyInstructionIndex'),
  borsh.u16('messageDataOffset'),
  borsh.u16('messageDataSize'),
  borsh.u16('messageInstructionIndex'),
]);

interface SignatureData {
  publicKey: PublicKey
  signature: Uint8Array
}

const SIGNATURE_DATA_LAYOUT: borsh.Layout<SignatureData> = borsh.struct([
  borsh.publicKey('publicKey'),
  borsh.array(borsh.u8(), 64, 'signature'),
]);

export class Ed25519InstructionService {

  static verify(
    message: Buffer,
    ...signers: Keypair[]
  ): TransactionInstruction {

    const request = <VerifySignaturesRequest>{
      numSignatures: signers.length,
      padding: 0,
    }
    const dataLength = VERIFY_SIGNATURES_REQUEST_LAYOUT.span
      + (SIGNATURE_OFFSET_LAYOUT.span + SIGNATURE_DATA_LAYOUT.span) * signers.length
      + message.length;
    const header = BorshService.serialize(VERIFY_SIGNATURES_REQUEST_LAYOUT, request, dataLength);

    const data = Buffer.alloc(dataLength);
    data.fill(header, 0);
    const messageOffset = VERIFY_SIGNATURES_REQUEST_LAYOUT.span
      + (SIGNATURE_OFFSET_LAYOUT.span + SIGNATURE_DATA_LAYOUT.span) * signers.length;
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const blockOffset = VERIFY_SIGNATURES_REQUEST_LAYOUT.span
        + SIGNATURE_OFFSET_LAYOUT.span * i;
      const signatureOffset = VERIFY_SIGNATURES_REQUEST_LAYOUT.span
        + SIGNATURE_OFFSET_LAYOUT.span * signers.length
        + SIGNATURE_DATA_LAYOUT.span * i;
      const signatureBlock = <SignatureOffset>{
        signatureOffset: signatureOffset + 32,
        signatureInstructionIndex: 65535,
        publicKeyOffset: signatureOffset + 0,
        publicKeyInstructionIndex: 65535,
        messageDataOffset: messageOffset,
        messageDataSize: message.length,
        messageInstructionIndex: 65535,
      };
      const signatureBlockData = BorshService.serialize(SIGNATURE_OFFSET_LAYOUT, signatureBlock, SIGNATURE_OFFSET_LAYOUT.span);
      data.fill(signatureBlockData, blockOffset);

      const signature = signMessage(
        message,
        signer.secretKey,
      );
      const signatureData = <SignatureData>{
        publicKey: signer.publicKey,
        signature,
      };
      const signatureDataData = BorshService.serialize(SIGNATURE_DATA_LAYOUT, signatureData, SIGNATURE_DATA_LAYOUT.span);
      data.fill(signatureDataData, signatureOffset);
    }
    data.fill(message, messageOffset);

    const keys: AccountMeta[] = []

    return new TransactionInstruction({
      keys,
      data,
      programId: Ed25519Program.programId,
    });
  }
}

function signMessage(
  message: Buffer,
  secretKey: Uint8Array,
): Uint8Array {
  return ed25519.sync.sign(message, secretKey.slice(0, 32));
}

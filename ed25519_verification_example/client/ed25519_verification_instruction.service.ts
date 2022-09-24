import {
  BorshCoder,
  Idl
} from '@project-serum/anchor';
import * as borsh from '@project-serum/borsh';
import {
  AccountMeta,
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';
import { SignatureTuple } from '@tforcexyz/solana-support-library';
import { ED25519_VERIFICATION_IDL } from './ed25519_verification.idl';

const coder = new BorshCoder(ED25519_VERIFICATION_IDL as Idl);

interface ValidateMessageSignatureRequest {
  message: Buffer
  signatures: SignatureTuple[],
  instructionData: Buffer,
}

const SIGNATURE_TUPLE_LAYOUT: borsh.Layout<SignatureTuple> = borsh.struct([
  borsh.publicKey('publicKey'),
  borsh.array(borsh.u8(), 64, 'signature'),
]);

export class Ed25519VerificationInstructionService {

  static validateMessageSignature(
    message: Buffer,
    signatures: SignatureTuple[],
    instructionData: Buffer,
    ed25519VerifyProgramId: PublicKey,
  ): TransactionInstruction {

    const request = <ValidateMessageSignatureRequest>{
      message,
      signatures,
      instructionData,
    };
    const data = coder.instruction.encode('validateMessageSignature', request);

    const keys: AccountMeta[] = [];

    return new TransactionInstruction({
      data,
      keys,
      programId: ed25519VerifyProgramId,
    });
  }
}

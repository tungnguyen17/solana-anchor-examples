import {
  BorshCoder,
  Idl
} from '@project-serum/anchor';
import {
  AccountMeta,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionInstruction
} from '@solana/web3.js';
import { SignatureTuple } from '@tforcexyz/solana-support-library';
import { ED25519_VERIFICATION_IDL } from './ed25519_verification.idl';

const coder = new BorshCoder(ED25519_VERIFICATION_IDL as Idl);

interface CreateCounterRequest {
  derivationPath: Buffer
}

interface CompareMessageSignatureRequest {
  message: Buffer
  signatures: SignatureTuple[],
  instructionData: Buffer,
}

interface ValidateMessageSignatureRequest {
  message: Buffer
  signatures: SignatureTuple[],
}

export interface Counter {
  signerCount: number;
}

export class Ed25519VerificationInstructionService {

  static createCounter(
    payerAddress: PublicKey,
    derivationPath: Buffer,
    ed25519VerifyProgramId: PublicKey,
  ): TransactionInstruction {

    const request: CreateCounterRequest = {
      derivationPath,
    };
    const data = coder.instruction.encode('createCounter', request);

    const counterAddress = this.findCounterAddress(
      derivationPath,
      ed25519VerifyProgramId,
    );
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: payerAddress, isSigner: false, isWritable: true, },
      <AccountMeta>{ pubkey: counterAddress, isSigner: false, isWritable: true, },
      <AccountMeta>{ pubkey: SystemProgram.programId, isSigner: false, isWritable: false, },
    ];

    return new TransactionInstruction({
      data,
      keys,
      programId: ed25519VerifyProgramId,
    });
  }

  static compareMessageSignature(
    message: Buffer,
    signatures: SignatureTuple[],
    instructionData: Buffer,
    ed25519VerifyProgramId: PublicKey,
  ): TransactionInstruction {

    const request = <CompareMessageSignatureRequest>{
      message,
      signatures,
      instructionData,
    };
    const data = coder.instruction.encode('compareMessageSignature', request);

    const keys: AccountMeta[] = [];

    return new TransactionInstruction({
      data,
      keys,
      programId: ed25519VerifyProgramId,
    });
  }

  static validateMessageSignature(
    message: Buffer,
    signatures: SignatureTuple[],
    counterAddress: PublicKey,
    ed25519VerifyProgramId: PublicKey,
  ): TransactionInstruction {

    const request = <ValidateMessageSignatureRequest>{
      message,
      signatures,
    };
    const data = coder.instruction.encode('validateMessageSignature', request);

    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: counterAddress, isSigner: false, isWritable: true, },
      <AccountMeta>{ pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false, },
    ];

    return new TransactionInstruction({
      data,
      keys,
      programId: ed25519VerifyProgramId,
    });
  }

  static decodeCounterAccount(
    data: Buffer
  ): Counter {
    return coder.accounts.decode('Counter', data);
  }

  static findCounterAddress(
    derivationPath: Buffer,
    programId: PublicKey,
  ): PublicKey {
    const [counterAddress,] = PublicKey.findProgramAddressSync(
      [derivationPath],
      programId,
    );
    return counterAddress;
  }
}

import { BorshCoder, Idl } from '@project-serum/anchor';
import { AccountMeta, PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { DURABLE_TRANSACTION_IDL } from './durable_transaction.idl';

const coder = new BorshCoder(DURABLE_TRANSACTION_IDL as Idl);

interface CreateCounterRequest {
  derivationPath: Buffer
}

interface InvokeRequest {
}

export interface Counter {
  signerCount: number;
}

export class DurableTransactionInstructionService {

  static createCounter(
    payerAddress: PublicKey,
    derivationPath: Buffer,
    programId: PublicKey,
  ): TransactionInstruction {

    const request: CreateCounterRequest = {
      derivationPath,
    };
    const data = coder.instruction.encode('createCounter', request);

    const counterAddress = this.findCounterAddress(
      derivationPath,
      programId,
    );
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: payerAddress, isSigner: false, isWritable: true, },
      <AccountMeta>{ pubkey: counterAddress, isSigner: false, isWritable: true, },
      <AccountMeta>{ pubkey: SystemProgram.programId, isSigner: false, isWritable: false, },
    ];

    return new TransactionInstruction({
      data,
      keys,
      programId,
    });
  }

  static invoke(
    senderAddress: PublicKey,
    signerAddresses: PublicKey[],
    counterAddress: PublicKey,
    programId: PublicKey,
  ): TransactionInstruction {

    const request: InvokeRequest = {
    };
    const data = coder.instruction.encode('invoke', request);

    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: senderAddress, isSigner: false, isWritable: false, },
      <AccountMeta>{ pubkey: counterAddress, isSigner: false, isWritable: true, },
    ];
    signerAddresses.forEach(addr => {
      keys.push(<AccountMeta>{ pubkey: addr, isSigner: true, isWritable: false, });
    });

    return new TransactionInstruction({
      data,
      keys,
      programId,
    });
  }

  static invokeUnique(
    sender: PublicKey,
    signers: PublicKey[],
    counter: PublicKey,
    programId: PublicKey,
  ): TransactionInstruction {

    const request: InvokeRequest = {
    };
    const data = coder.instruction.encode('invokeUnique', request);

    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: sender, isSigner: false, isWritable: false, },
      <AccountMeta>{ pubkey: counter, isSigner: false, isWritable: true, },
    ];
    signers.forEach(addr => {
      keys.push(<AccountMeta>{ pubkey: addr, isSigner: true, isWritable: false, });
    });

    return new TransactionInstruction({
      data,
      keys,
      programId,
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

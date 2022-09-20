import { BorshCoder, Idl } from '@project-serum/anchor';
import { AccountMeta, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { DURABLE_TRANSACTION_IDL } from './durable_transaction.idl';

const coder = new BorshCoder(DURABLE_TRANSACTION_IDL as Idl);

interface InvokeRequest {
}

export class DurableTransactionInstructionService {

  static invoke(
    sender: PublicKey,
    signers: PublicKey[],
    nonSigners: PublicKey[],
    programId: PublicKey,
  ): TransactionInstruction {

    const request: InvokeRequest = {
    };
    const data = coder.instruction.encode('invoke', request);

    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: sender, isSigner: false, isWritable: false, },
    ];
    signers.forEach(addr => {
      keys.push(<AccountMeta>{ pubkey: addr, isSigner: true, isWritable: false, });
    });
    nonSigners.forEach(addr => {
      keys.push(<AccountMeta>{ pubkey: addr, isSigner: false, isWritable: false, });
    });

    return new TransactionInstruction({
      data,
      keys,
      programId,
    });
  }
}

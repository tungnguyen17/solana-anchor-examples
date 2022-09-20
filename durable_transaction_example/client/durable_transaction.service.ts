import {
  Connection,
  Keypair,
  PublicKey,
  Transaction
} from '@solana/web3.js';
import { sendTransaction } from '@tforcexyz/solana-support-library';
import { DurableTransactionInstructionService } from './durable_transaction_instruction.service';

export class DurableTransactionService {

  static async readme(
    connection: Connection,
    payerAccount: Keypair,
    signerAccounts: Keypair[],
    nonSignerAddresses: PublicKey[],
    programId: PublicKey,
  ): Promise<void> {

    const transaction: Transaction = new Transaction();

    const readmeInstruction = DurableTransactionInstructionService.invoke(
      payerAccount.publicKey,
      signerAccounts.map(acc => acc.publicKey),
      nonSignerAddresses,
      programId,
    )
    transaction.add(readmeInstruction);

    const txSign: string | any = await sendTransaction(
      connection,
      transaction,
      [
        payerAccount,
      ],
    );

    console.log(`Invoke call with all signers`, '---', txSign, '\n');

    return txSign;
  }
}

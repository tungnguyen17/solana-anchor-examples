import {
  Connection,
  Keypair,
  PublicKey,
  Transaction
} from '@solana/web3.js';
import { sendTransaction } from '@tforcexyz/solana-support-library';
import { DurableTransactionInstructionService } from './durable_transaction_instruction.service';

export class DurableTransactionService {

  static async invoke(
    connection: Connection,
    payerAccount: Keypair,
    signerAddresses: PublicKey[],
    signerAccounts: Keypair[],
    checkUnique: boolean,
    programId: PublicKey,
  ): Promise<number> {

    const transaction: Transaction = new Transaction();

    const counterAccount = Keypair.generate();
    const createCounterInstruction = DurableTransactionInstructionService.createCounter(
      payerAccount.publicKey,
      counterAccount.publicKey.toBuffer(),
      programId,
    );
    transaction.add(createCounterInstruction);

    const counterAddress = DurableTransactionInstructionService.findCounterAddress(
      counterAccount.publicKey.toBuffer(),
      programId,
    );
    const invokeInstruction = checkUnique
      ? DurableTransactionInstructionService.invokeUnique(
        payerAccount.publicKey,
        signerAddresses,
        counterAddress,
        programId,
      )
      : DurableTransactionInstructionService.invoke(
        payerAccount.publicKey,
        signerAddresses,
        counterAddress,
        programId,
      );
    transaction.add(invokeInstruction);

    const txSign: string | any = await sendTransaction(
      connection,
      transaction,
      [
        payerAccount,
        ...signerAccounts,
      ],
    );

    const counterAccountInfo = await connection.getAccountInfo(counterAddress);
    let signerCount = -1;
    if (counterAccountInfo) {
      const counterAccountData = DurableTransactionInstructionService.decodeCounterAccount(counterAccountInfo.data);
      signerCount = counterAccountData.signerCount;
    }

    console.info(`Invoke call with ${signerCount} signers`, '---', txSign, '\n');
    return signerCount;
  }
}

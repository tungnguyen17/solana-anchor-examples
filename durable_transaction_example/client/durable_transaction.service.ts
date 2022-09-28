import {
  Connection,
  Keypair,
  NonceAccount,
  NONCE_ACCOUNT_LENGTH,
  PublicKey,
  SystemProgram,
  Transaction
} from '@solana/web3.js';
import { executeTransaction } from '@tforcexyz/solana-support-library';
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

    const transaction = new Transaction();

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

    const txSign = await executeTransaction(
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

  static async createDurableTransaction(
    connection: Connection,
    payerAccount: Keypair,
    signerAddresses: PublicKey[],
    checkUnique: boolean,
    programId: PublicKey,
  ): Promise<Buffer> {

    const transaction = new Transaction();

    const nonceAccount = Keypair.generate();
    const lamportAmount = await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH);
    const createNonceAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payerAccount.publicKey,
      newAccountPubkey: nonceAccount.publicKey,
      lamports: lamportAmount,
      space: NONCE_ACCOUNT_LENGTH,
      programId: SystemProgram.programId,
    });
    transaction.add(createNonceAccountInstruction);

    const initializeNonceInstruction = SystemProgram.nonceInitialize({
      noncePubkey: nonceAccount.publicKey,
      authorizedPubkey: payerAccount.publicKey,
    });
    transaction.add(initializeNonceInstruction);

    await executeTransaction(
      connection,
      transaction,
      [
        payerAccount,
        nonceAccount,
      ],
    );

    const nonceTransaction = new Transaction();

    const advanceNonceInstruction = SystemProgram.nonceAdvance({
      noncePubkey: nonceAccount.publicKey,
      authorizedPubkey: payerAccount.publicKey,
    });
    nonceTransaction.add(advanceNonceInstruction);

    const counterAccount = Keypair.generate();
    const createCounterInstruction = DurableTransactionInstructionService.createCounter(
      payerAccount.publicKey,
      counterAccount.publicKey.toBuffer(),
      programId,
    );
    nonceTransaction.add(createCounterInstruction);

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
      nonceTransaction.add(invokeInstruction);

    let nonceAccountInfo = await connection.getAccountInfo(nonceAccount.publicKey);
    if(nonceAccountInfo != null) {
      let nonceAccountData = NonceAccount.fromAccountData(nonceAccountInfo.data);
      nonceTransaction.feePayer = payerAccount.publicKey;
      nonceTransaction.recentBlockhash = nonceAccountData.nonce;
    }
    nonceTransaction.sign(payerAccount);

    const rawTransaction = nonceTransaction.serialize({
      requireAllSignatures: false,
    });
    return rawTransaction;
  }

  static approveTransaction(
    rawTransaction: Buffer,
    signer: Keypair,
  ): Buffer {
    const transaction = Transaction.from(rawTransaction);
    transaction.sign(signer);
    const signaturePair = transaction.signatures.find(sign =>
      sign.publicKey.toBase58() == signer.publicKey.toBase58()
    );
    return signaturePair
      ? (signaturePair.signature?? Buffer.from([]))
      : Buffer.from([]);
  }
}

import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';

export class SystemProgramService {
  static async transfer(
    connection: Connection,
    payerAccount: Keypair,
    recipientAddress: PublicKey,
    amount: number,
  ): Promise<boolean> {
    const transaction: Transaction = new Transaction()
    transaction.add(SystemProgram.transfer({
      fromPubkey: payerAccount.publicKey,
      toPubkey: recipientAddress,
      lamports: amount,
    }))
    const signers = [
      payerAccount
    ]
    const txSign = await sendAndConfirmTransaction(connection, transaction, signers)
    console.log(`Transferred ${amount} lamports from ${payerAccount.publicKey.toBase58()} to ${recipientAddress.toBase58()}`, '---', txSign, '\n')
    return true
  }
}

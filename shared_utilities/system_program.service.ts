import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";

export class SystemProgramService {
  static async transfer(
    connection: Connection,
    payerAccount: Keypair,
    senderAccount: Keypair,
    recipientAddress: PublicKey,
    amount: number,
  ): Promise<boolean> {
    const transaction: Transaction = new Transaction()
    transaction.add(SystemProgram.transfer({
      fromPubkey: senderAccount.publicKey,
      toPubkey: recipientAddress,
      lamports: amount,
    }))
    const signers = [
      payerAccount
    ]
    if (payerAccount.publicKey != senderAccount.publicKey) {
      signers.push(senderAccount)
    }
    const txSign = await sendAndConfirmTransaction(connection, transaction, signers)
    console.log(`Transferred ${amount} lamports from ${senderAccount.publicKey.toBase58()} to ${recipientAddress.toBase58()}`, '---', txSign, '\n')
    return true
  }
}

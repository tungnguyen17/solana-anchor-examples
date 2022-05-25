import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';
import { StandaloneSplTokenInstructionService } from './standalone_spl_token_instruction.service';

export class StandaloneTokenService {

  static async readme(
    connection: Connection,
    payerAccount: Keypair,
    tokenAccountAddress: PublicKey,
    tokenMintAddress: PublicKey,
    programId: PublicKey,
  ): Promise<void> {

    const transaction: Transaction = new Transaction()

    const readmeInstruction = StandaloneSplTokenInstructionService.readme(
      tokenAccountAddress,
      tokenMintAddress,
      programId,
    )
    transaction.add(readmeInstruction)

    const txSign: string | any = await sendAndConfirmTransaction(
      connection,
      transaction,
      [
        payerAccount,
      ],
    )

    console.log(`Readme call`, '---', txSign, '\n')

    return txSign
  }
}

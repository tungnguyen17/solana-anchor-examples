import { AccountMeta, PublicKey, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { SolanaService } from './solana.service'

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

export class TokenProgramService {
  static createInitializeMintTransaction(
    payerAddress: PublicKey,
    tokenAddress: PublicKey,
    decimals: number,
    mintAuthorityAddress: PublicKey,
    freezeAuthorityAddress: PublicKey | null,
  ): Transaction {
    const transaction = new Transaction()
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payerAddress,
        newAccountPubkey: tokenAddress,
        lamports: 10000000,
        space: 82,
        programId: TOKEN_PROGRAM_ID,
      }),
    )

    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: tokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ]
    const data = SolanaService.encodeTokenInstruction({
      initializeMint: {
        decimals,
        mintAuthority: mintAuthorityAddress.toBuffer(),
        freezeAuthorityOption: freezeAuthorityAddress == null ? 0 : 1,
        freezeAuthority: (freezeAuthorityAddress == null ? new PublicKey(0) : freezeAuthorityAddress).toBuffer(),
      }
    })
    transaction.add(
      new TransactionInstruction({
        keys,
        programId: TOKEN_PROGRAM_ID,
        data,
      })
    )

    return transaction
  }
}

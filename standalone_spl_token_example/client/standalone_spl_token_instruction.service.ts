import { BorshCoder, Idl } from '@project-serum/anchor'
import { AccountMeta, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { STANDALONE_SPL_TOKEN_IDL } from './standalone_spl_token.idl'

const coder = new BorshCoder(STANDALONE_SPL_TOKEN_IDL as Idl)

interface ReadmeRequest {
}

export class StandaloneSplTokenInstructionService {

  static readme(
    tokenAccountAddress: PublicKey,
    tokenMintAddress: PublicKey,
    programId: PublicKey,
  ): TransactionInstruction {

    const request: ReadmeRequest = {
    }
    const data = coder.instruction.encode('readme', request)

    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: tokenAccountAddress, isSigner: false, isWritable: false, },
      <AccountMeta>{ pubkey: tokenMintAddress, isSigner: false, isWritable: false, },
    ]

    return new TransactionInstruction({
      data,
      keys,
      programId,
    })
  }
}

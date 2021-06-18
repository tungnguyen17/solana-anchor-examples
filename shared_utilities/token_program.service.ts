import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js'
import { SolanaService } from './solana.service'
import { ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TokenProgramInstructionService, TOKEN_PROGRAM_ID } from './token_program_instruction.service'

export class TokenProgramService {
  static async createTokenAccount(
    connection: Connection,
    payerAccount: Keypair,
    tokenMintAccount: Keypair,
    decimals: number,
    mintAuthorityAddress: PublicKey,
    freezeAuthorityAddress: PublicKey | null,
  ): Promise<Keypair> {
    if (await SolanaService.isAddressInUse(connection, tokenMintAccount.publicKey)) {
      console.log(`SKIPPED: Token Account ${tokenMintAccount.publicKey.toBase58()} is already existed`, '\n')
      return tokenMintAccount
    }
    const transaction = await TokenProgramInstructionService.createInitializeMintTransaction(
      connection,
      payerAccount.publicKey,
      tokenMintAccount.publicKey,
      decimals,
      mintAuthorityAddress,
      freezeAuthorityAddress,
    )
    const txSign = await sendAndConfirmTransaction(connection, transaction, [
      payerAccount,
      tokenMintAccount,
    ])
    console.log(`Created Token Account ${tokenMintAccount.publicKey.toBase58()}`, '---', txSign, '\n')
    return tokenMintAccount
  }

  static async createAssociatedTokenAccount(
    connection: Connection,
    payerAccount: Keypair,
    ownerAddress: PublicKey,
    tokenMintAddress: PublicKey,
  ): Promise<PublicKey> {
    const tokenAccountAddress = await TokenProgramService.findAssociatedTokenAddress(ownerAddress, tokenMintAddress)
    if (await SolanaService.isAddressInUse(connection, tokenAccountAddress)) {
      console.log(`SKIPPED: Associated Token Account ${tokenAccountAddress.toBase58()} of Account ${ownerAddress.toBase58()} is already existed`, '\n')
      return tokenAccountAddress
    }
    const transaction = await TokenProgramInstructionService.createAssociatedTokenAccountTransaction(
      payerAccount.publicKey,
      ownerAddress,
      tokenMintAddress,
    )
    const txSign = await sendAndConfirmTransaction(connection, transaction, [
      payerAccount,
    ])
    console.log(`Created Associated Token Account ${tokenAccountAddress.toBase58()} for Account ${ownerAddress.toBase58()}`, '---', txSign, '\n')
    return tokenAccountAddress
  }

  static async mint(
    connection: Connection,
    payerAccount: Keypair,
    authorityAccount: Keypair,
    tokenMintAddress: PublicKey,
    recipientTokenAddress: PublicKey,
    amount: number,
  ): Promise<boolean> {
    const transaction = await TokenProgramInstructionService.createMintToTransaction(
      authorityAccount.publicKey,
      tokenMintAddress,
      recipientTokenAddress,
      amount,
    )
    const signers = [
      payerAccount
    ]
    if (payerAccount.publicKey != authorityAccount.publicKey) {
      signers.push(authorityAccount)
    }
    const txSign = await sendAndConfirmTransaction(connection, transaction, signers)
    console.log(`Minted ${amount} token units to ${recipientTokenAddress.toBase58()}`, '---', txSign, '\n')
    return true
  }

  static async transfer(
    connection: Connection,
    payerAccount: Keypair,
    ownerAccount: Keypair,
    ownerTokenAddress: PublicKey,
    recipientTokenAddress: PublicKey,
    amount: number,
  ): Promise<boolean> {
    const transaction = await TokenProgramInstructionService.createTransferTransaction(
      ownerAccount.publicKey,
      ownerTokenAddress,
      recipientTokenAddress,
      amount,
    )
    const signers = [
      payerAccount
    ]
    if (payerAccount.publicKey != ownerAccount.publicKey) {
      signers.push(ownerAccount)
    }
    const txSign = await sendAndConfirmTransaction(connection, transaction, signers)
    console.log(`Transferred ${amount} token units from ${ownerTokenAddress.toBase58()} to ${recipientTokenAddress.toBase58()}`, '---', txSign, '\n')
    return true
  }

  static async findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey,
  ): Promise<PublicKey> {
    const [address, ] = await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );
    return address
  }
}

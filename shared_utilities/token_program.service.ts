import { AccountMeta, Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from '@solana/web3.js'
import { SolanaService } from './solana.service'

const ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
const TOKEN_PROGRAM_ID: PublicKey = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

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
      console.log(`SKIPPED: Token Account ${tokenMintAccount.publicKey.toBase58()} is already existed.`)
      return tokenMintAccount
    }
    const transaction = new Transaction()
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payerAccount.publicKey,
        newAccountPubkey: tokenMintAccount.publicKey,
        lamports: 10000000,
        space: 82,
        programId: TOKEN_PROGRAM_ID,
      }),
    )

    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: tokenMintAccount.publicKey, isSigner: false, isWritable: true },
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
    await sendAndConfirmTransaction(connection, transaction, [
      payerAccount,
      tokenMintAccount
    ])
    console.log(`Created Token Account ${tokenMintAccount.publicKey.toBase58()}`)
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
      console.log(`SKIPPED: Associated Token Account ${tokenAccountAddress.toBase58()} of Account ${ownerAddress.toBase58()} is already existed.`)
      return tokenAccountAddress
    }
    const transaction: Transaction = new Transaction()
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: payerAccount.publicKey, isSigner: true, isWritable: true },
      <AccountMeta>{ pubkey: tokenAccountAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: ownerAddress, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: tokenMintAddress, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ]
    const data = SolanaService.encodeAssociateTokenInstruction({})
    transaction.add(new TransactionInstruction({
      keys,
      data,
      programId: ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    }))
    await sendAndConfirmTransaction(connection, transaction, [
      payerAccount
    ])
    console.log(`Created Associated Token Account ${tokenAccountAddress.toBase58()} for Account ${ownerAddress.toBase58()}`)
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
    const transaction: Transaction = new Transaction()
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: tokenMintAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: recipientTokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: authorityAccount.publicKey, isSigner: true, isWritable: false },
    ];
    const data = SolanaService.encodeTokenInstruction({ mintTo: {
      amount
    }})
    transaction.add(new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID
    }))
    const signers = [
      payerAccount
    ]
    if (payerAccount.publicKey != authorityAccount.publicKey) {
      signers.push(authorityAccount)
    }
    await sendAndConfirmTransaction(connection, transaction, signers)
    console.log(`Minted ${amount} token units to ${recipientTokenAddress.toBase58()}.`)
    return true
  }

  static async trasnfer(
    connection: Connection,
    ownerAccount: Keypair,
    ownerTokenAddress: PublicKey,
    recipientTokenAddress: PublicKey,
    amount: number,
  ): Promise<boolean> {
    const transaction: Transaction = new Transaction()
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: ownerTokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: recipientTokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: ownerAccount.publicKey, isSigner: true, isWritable: false },
    ];
    const data = SolanaService.encodeTokenInstruction({ transfer: {
      amount
    }})
    transaction.add(new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID
    }))
    await sendAndConfirmTransaction(connection, transaction, [
      ownerAccount
    ])
    console.log(`Transferred ${amount} token units from ${ownerTokenAddress.toBase58()} to ${recipientTokenAddress.toBase58()}`)
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

import { AccountMeta, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from '@solana/web3.js'
import { SolanaService } from './solana.service'

const ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
const TOKEN_PROGRAM_ID: PublicKey = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

export class TokenProgramService {
  static async createInitializeMintTransaction(
    payerAddress: PublicKey,
    tokenMintAddress: PublicKey,
    decimals: number,
    mintAuthorityAddress: PublicKey,
    freezeAuthorityAddress: PublicKey | null,
  ): Promise<Transaction> {
    const transaction = new Transaction()
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payerAddress,
        newAccountPubkey: tokenMintAddress,
        lamports: 10000000,
        space: 82,
        programId: TOKEN_PROGRAM_ID,
      }),
    )

    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: tokenMintAddress, isSigner: false, isWritable: true },
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

  static async createInitializeAccountTransaction(
    payerAddress: PublicKey,
    ownerAddress: PublicKey,
    tokenMintAddress: PublicKey,
  ): Promise<Transaction> {
    const transaction: Transaction = new Transaction()
    const tokenAccountAddress = await TokenProgramService.findAssociatedTokenAddress(ownerAddress, tokenMintAddress)

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payerAddress,
        newAccountPubkey: tokenAccountAddress,
        lamports: 10000000,
        space: 165,
        programId: TOKEN_PROGRAM_ID,
      }),
    );

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payerAddress,
        toPubkey: tokenAccountAddress,
        lamports: 2039280,
      }),
    );

    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: tokenAccountAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: tokenMintAddress, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: ownerAddress, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    const data = SolanaService.encodeTokenInstruction({ initializeAccount: {}})
    transaction.add(new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID,
    }));
    return transaction
  }

  static async createAssociatedTokenAccountTransaction(
    payerAddress: PublicKey,
    ownerAddress: PublicKey,
    tokenMintAddress: PublicKey,
  ): Promise<Transaction> {
    const transaction: Transaction = new Transaction()
    const tokenAccountAddress = await TokenProgramService.findAssociatedTokenAddress(ownerAddress, tokenMintAddress)
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: payerAddress, isSigner: true, isWritable: true },
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
    return transaction
  }

  static async createTransferTransaction(
    ownerAddress: PublicKey,
    sourceTokenAddress: PublicKey,
    targetTokenAddress: PublicKey,
    amount: number,
  ): Promise<Transaction> {
    const transaction: Transaction = new Transaction()
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: sourceTokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: targetTokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: ownerAddress, isSigner: true, isWritable: false },
    ];
    const data = SolanaService.encodeTokenInstruction({ transfer: {
      amount
    }})
    transaction.add(new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID
    }))
    return transaction
  }

  static async createMintToTransaction(
    authorityAddress: PublicKey,
    tokenMintAddress: PublicKey,
    targetTokenAddress: PublicKey,
    amount: number,
  ): Promise<Transaction> {
    const transaction: Transaction = new Transaction()
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: tokenMintAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: targetTokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: authorityAddress, isSigner: true, isWritable: false },
    ];
    const data = SolanaService.encodeTokenInstruction({ mintTo: {
      amount
    }})
    transaction.add(new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID
    }))
    return transaction
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

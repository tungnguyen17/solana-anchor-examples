import * as borsh from '@project-serum/borsh';
import { AccountMeta, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import { BorshService } from './borsh.service';

export const ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
export const TOKEN_PROGRAM_ID: PublicKey = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

class CreateAssociatedTokenAccountRequest {
}

const CREATE_ASSOCIATED_TOKEN_ACCOUNT_LAYOUT: borsh.Layout<CreateAssociatedTokenAccountRequest> = borsh.struct(
  []
)

interface ApproveRequest {
  instruction: number
  amount: BN
}

const APPROVE_LAYOUT: borsh.Layout<ApproveRequest> = borsh.struct(
  [
    borsh.u8('instruction'),
    borsh.u64('amount'),
  ]
)

interface BurnRequest {
  instruction: number
  amount: BN
}

const BURN_LAYOUT: borsh.Layout<BurnRequest> = borsh.struct(
  [
    borsh.u8('instruction'),
    borsh.u64('amount'),
  ]
)

interface ChangeAuthorityRequest {
  instruction: number
  type: number
  authority?: PublicKey
}

const CHANGE_AUTHORITY_LAYOUT: borsh.Layout<ChangeAuthorityRequest> = borsh.struct(
  [
    borsh.u8('instruction'),
    borsh.u8('type'),
    borsh.option(borsh.publicKey(), 'authority'),
  ]
)

interface CloseAccountRequest {
  instruction: number
}

const CLOSE_ACCOUNT_LAYOUT: borsh.Layout<CloseAccountRequest> = borsh.struct(
  [
    borsh.u8('instruction'),
  ]
)

interface InitializeAccountRequest {
  instruction: number
}

export const INITIALIZE_ACCOUNT_SPAN = 165

const INITIALIZE_ACCOUNT_LAYOUT: borsh.Layout<InitializeAccountRequest> = borsh.struct(
  [
    borsh.u8('instruction'),
  ]
)

interface InitializeMintRequest {
  instruction: number
  decimals: number
  mintAuthority: PublicKey
  freezeAuthority?: PublicKey
}

export const INITIALIZE_MINT_SPAN = 82

const INITIALIZE_MINT_LAYOUT: borsh.Layout<InitializeMintRequest> = borsh.struct(
  [
    borsh.u8('instruction'),
    borsh.u8('decimals'),
    borsh.publicKey('mintAuthority'),
    borsh.option(borsh.publicKey(), 'freezeAuthority')
  ]
)

interface MintRequest {
  instruction: number
  amount: BN
}

const MINT_LAYOUT: borsh.Layout<MintRequest> = borsh.struct(
  [
    borsh.u8('instruction'),
    borsh.u64('amount'),
  ]
)

export interface TransferRequest {
  instruction: number
  amount: BN
}

const TRANSFER_LAYOUT: borsh.Layout<TransferRequest> = borsh.struct(
  [
    borsh.u8('instruction'),
    borsh.u64('amount'),
  ]
)

interface FreezeAccountRequest {
  instruction: number
}

const FREEZE_ACCOUNT_LAYOUT: borsh.Layout<FreezeAccountRequest> = borsh.struct(
  [
    borsh.u8('instruction'),
  ]
)

interface ThawAccountRequest {
  instruction: number
}

const THAW_ACCOUNT_LAYOUT: borsh.Layout<ThawAccountRequest> = borsh.struct(
  [
    borsh.u8('instruction'),
  ]
)

// ref: https://github.com/solana-labs/solana-program-library/blob/cd63580b796319056edbbcca8690deb54c56581d/token/js/client/token.js#L149
interface TokenAccountData {
  mint: PublicKey
  owner: PublicKey
  amount: BN
  delegateOption: number
  delegate: PublicKey
  state: number
  isNativeOption: number
  isNative: BN
  delegatedAmount: BN
  closeAuthorityOption: number
  closeAuthority: PublicKey
}

export interface TokenAccountInfo {
  address: PublicKey
  mint: PublicKey
  owner: PublicKey
  amount: BN
  decimals: number
  delegate: null | PublicKey
  delegatedAmount: BN
  isInitialized: boolean
  isFrozen: boolean
  isNative: boolean
  rentExemptReserve: null | BN
  closeAuthority: null | PublicKey
}

const TOKEN_ACCOUNT: borsh.Layout<TokenAccountData> = borsh.struct(
  [
    borsh.publicKey('mint'),
    borsh.publicKey('owner'),
    borsh.u64('amount'),
    borsh.u32('delegateOption'),
    borsh.publicKey('delegate'),
    borsh.u8('state'),
    borsh.u32('isNativeOption'),
    borsh.u64('isNative'),
    borsh.u64('delegatedAmount'),
    borsh.u32('closeAuthorityOption'),
    borsh.publicKey('closeAuthority'),
  ]
)

// ref: https://github.com/solana-labs/solana-program-library/blob/cd63580b796319056edbbcca8690deb54c56581d/token/js/client/token.js#L107
export interface TokenMintData {
  mintAuthorityOption: number
  mintAuthority: PublicKey
  supply: BN
  decimals: number
  isInitialized: number
  freezeAuthorityOption: number
  freezeAuthority: PublicKey
}

export interface TokenMintInfo {
  address: PublicKey
  supply: BN
  decimals: number
  isInitialized: boolean
  mintAuthority: null | PublicKey
  freezeAuthority: null | PublicKey
}

const TOKEN_MINT_LAYOUT: borsh.Layout<TokenMintData> = borsh.struct(
  [
    borsh.u32('mintAuthorityOption'),
    borsh.publicKey('mintAuthority'),
    borsh.u64('supply'),
    borsh.u8('decimals'),
    borsh.u8('isInitialized'),
    borsh.u32('freezeAuthorityOption'),
    borsh.publicKey('freezeAuthority'),
  ]
)

export class TokenProgramInstructionService {

  static approve(
    ownerAddress: PublicKey,
    ownerTokenAddress: PublicKey,
    delegateAddress: PublicKey,
    amount: BN,
  ): TransactionInstruction {
    const request = <ApproveRequest>{
      instruction: 4,
      amount: amount,
    }
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: ownerTokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: delegateAddress, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: ownerAddress, isSigner: true, isWritable: false },
    ]
    const data = BorshService.serialize(APPROVE_LAYOUT, request, 10)

    return new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID,
    })
  }

  static burn(
    mintAddress: PublicKey,
    ownerAddress: PublicKey,
    userTokenAddress: PublicKey,
    amount: number,
  ): TransactionInstruction {
    const request = <BurnRequest>{
      instruction: 8,
      amount: new BN(amount),
    }
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: userTokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: mintAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: ownerAddress, isSigner: true, isWritable: false },
    ]
    const data = BorshService.serialize(BURN_LAYOUT, request, 10)

    return new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID,
    })
  }

  static async createAssociatedTokenAccount(
    payerAddress: PublicKey,
    ownerAddress: PublicKey,
    tokenMintAddress: PublicKey,
  ): Promise<TransactionInstruction> {
    const tokenAccountAddress = await TokenProgramInstructionService.findAssociatedTokenAddress(ownerAddress, tokenMintAddress)
    const request = <CreateAssociatedTokenAccountRequest>{}
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: payerAddress, isSigner: true, isWritable: true },
      <AccountMeta>{ pubkey: tokenAccountAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: ownerAddress, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: tokenMintAddress, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ]
    const data = BorshService.serialize(CREATE_ASSOCIATED_TOKEN_ACCOUNT_LAYOUT, request, 10)

    return new TransactionInstruction({
      keys,
      data,
      programId: ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    })
  }

  static changeAuthority(
    payerAddress: PublicKey,
    mintAddress: PublicKey,
    authorityType: number,
    authorityAddress: PublicKey | null,
  ): TransactionInstruction {
    const request = <ChangeAuthorityRequest>{
      instruction: 6,
      type: authorityType,
      authority: authorityAddress,
    }
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: mintAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: payerAddress, isSigner: true, isWritable: false },
    ]
    const data = BorshService.serialize(CHANGE_AUTHORITY_LAYOUT, request, 100)

    return new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID,
    })
  }

  static closeAccount(
    ownerAddress: PublicKey,
    tokenAddressToClose: PublicKey,
  ): TransactionInstruction {
    const request = <CloseAccountRequest>{
      instruction: 9,
    }
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: tokenAddressToClose, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: ownerAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: ownerAddress, isSigner: true, isWritable: false },
    ];
    const data = BorshService.serialize(CLOSE_ACCOUNT_LAYOUT, request, 2)

    return new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID,
    })
  }

  static initializeAccount(
    ownerAddress: PublicKey,
    tokenMintAddress: PublicKey,
    tokenAccountAddress: PublicKey,
  ): TransactionInstruction {
    const request = <InitializeAccountRequest>{
      instruction: 1,
    }
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: tokenAccountAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: tokenMintAddress, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: ownerAddress, isSigner: false, isWritable: false },
      <AccountMeta>{ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    const data = BorshService.serialize(INITIALIZE_ACCOUNT_LAYOUT, request, 2)

    return new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID,
    })
  }

  static initializeMint(
    tokenMintAddress: PublicKey,
    decimals: number,
    mintAuthorityAddress: PublicKey,
    freezeAuthorityAddress: PublicKey | null,
  ): TransactionInstruction {
    const request = <InitializeMintRequest>{
      instruction: 0,
      decimals,
      mintAuthority: mintAuthorityAddress,
      freezeAuthority: freezeAuthorityAddress,
    }
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: tokenMintAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ]
    const data = BorshService.serialize(INITIALIZE_MINT_LAYOUT, request, 67)

    return new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID,
    })
  }

  static mint(
    authorityAddress: PublicKey,
    tokenMintAddress: PublicKey,
    targetTokenAddress: PublicKey,
    amount: BN,
  ): TransactionInstruction {
    const request = <MintRequest>{
      instruction: 7,
      amount: amount,
    }
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: tokenMintAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: targetTokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: authorityAddress, isSigner: true, isWritable: false },
    ];
    const data = BorshService.serialize(MINT_LAYOUT, request, 10)

    return new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID,
    })
  }

  static transfer(
    ownerAddress: PublicKey,
    sourceTokenAddress: PublicKey,
    targetTokenAddress: PublicKey,
    amount: BN,
  ): TransactionInstruction {
    const request = <TransferRequest>{
      instruction: 3,
      amount: amount,
    }
    const keys: AccountMeta[] = [
      <AccountMeta>{ pubkey: sourceTokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: targetTokenAddress, isSigner: false, isWritable: true },
      <AccountMeta>{ pubkey: ownerAddress, isSigner: true, isWritable: false },
    ];
    const data = BorshService.serialize(TRANSFER_LAYOUT, request, 10)

    return new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID,
    })
  }

  static freezeAccount(
    accountAddress: PublicKey,
    mintAddress: PublicKey,
    authorityAddress: PublicKey
  ): TransactionInstruction {
    const request = <FreezeAccountRequest> {
      instruction: 10
    }

    const data: Buffer = BorshService.serialize(FREEZE_ACCOUNT_LAYOUT, request, 10)

    const keys: AccountMeta[] = [
      <AccountMeta> { pubkey: accountAddress, isSigner: false, isWritable: true },
      <AccountMeta> { pubkey: mintAddress, isSigner: false, isWritable: false },
      <AccountMeta> { pubkey: authorityAddress, isSigner: true, isWritable: false },
    ]

    return new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID
    })
  }

  static thawAccount(
    accountAddress: PublicKey,
    mintAddress: PublicKey,
    authorityAddress: PublicKey
  ): TransactionInstruction {
    const request = <ThawAccountRequest> {
      instruction: 11
    }

    const data: Buffer = BorshService.serialize(THAW_ACCOUNT_LAYOUT, request, 10)

    const keys: AccountMeta[] = [
      <AccountMeta> { pubkey: accountAddress, isSigner: false, isWritable: true },
      <AccountMeta> { pubkey: mintAddress, isSigner: false, isWritable: false },
      <AccountMeta> { pubkey: authorityAddress, isSigner: true, isWritable: false },
    ]

    return new TransactionInstruction({
      keys,
      data,
      programId: TOKEN_PROGRAM_ID
    })
  }

  static decodeTokenAccountInfo(
    data: Buffer
  ): TokenAccountInfo {
    const decodedData: TokenAccountData = BorshService.deserialize(TOKEN_ACCOUNT, data)
    return <TokenAccountInfo>{
      mint: decodedData.mint,
      owner: decodedData.owner,
      amount: decodedData.amount,
      delegate: decodedData.delegateOption === 0 ? null : decodedData.delegate,
      delegatedAmount: decodedData.delegateOption === 0 ? new BN(0) : decodedData.delegatedAmount,
      isInitialized: decodedData.state !== 0,
      isFrozen: decodedData.state === 2,
      isNative: decodedData.isNativeOption === 1,
      rentExemptReserve: decodedData.isNativeOption === 1 ? decodedData.isNative : null,
      closeAuthority: decodedData.closeAuthorityOption === 0 ? null : decodedData.closeAuthority,
    }
  }

  static decodeTokenMintInfo(
    data: Buffer
  ): TokenMintInfo {
    const decodedData: TokenMintData = BorshService.deserialize(TOKEN_MINT_LAYOUT, data)
    return <TokenMintInfo>{
      supply: decodedData.supply,
      decimals: decodedData.decimals,
      isInitialized: decodedData.isInitialized !== 0,
      mintAuthority: decodedData.mintAuthorityOption === 0 ? null : decodedData.mintAuthority,
      freezeAuthority: decodedData.freezeAuthorityOption === 0 ? null : decodedData.freezeAuthority,
    }
  }

  static decodeTransferInstruction(
    data: Buffer,
  ): TransferRequest {
    return BorshService.deserialize(TRANSFER_LAYOUT, data)
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

export class AuthorityTypes {
  static MintTokens = 0
  static FreezeAccount = 1
  static AccountOwner = 2
  static CloseAccount = 3
}

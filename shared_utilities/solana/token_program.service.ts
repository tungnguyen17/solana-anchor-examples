import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import BN from 'bn.js'
import { SolanaService } from './solana.service'
import { ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, INITIALIZE_ACCOUNT_SPAN, INITIALIZE_MINT_SPAN, TokenAccountInfo, TokenMintInfo, TokenProgramInstructionService, TOKEN_PROGRAM_ID } from './token_program_instruction.service'

export class TokenProgramService {

  static async approve(
    connection: Connection,
    payerAccount: Keypair,
    payerTokenAddress: PublicKey,
    delegateAddress: PublicKey,
    amount: BN,
  ): Promise<boolean> {
    const transaction = new Transaction()

    const approveInstruction = TokenProgramInstructionService.approve(
      payerAccount.publicKey,
      payerTokenAddress,
      delegateAddress,
      amount,
    )
    transaction.add(approveInstruction)

    const signers = [
      payerAccount
    ]
    const txSign = await sendAndConfirmTransaction(connection, transaction, signers)
    console.log(`Delegated ${amount} token units to ${delegateAddress.toBase58()}`, '---', txSign, '\n')
    return true
  }

  static async checkAddressType(
    connection: Connection,
    address: PublicKey,
  ): Promise<number> {
    const accountInfo = await connection.getAccountInfo(address)
    if (!accountInfo) {
      return 0
    }
    if (accountInfo.owner.toBase58() === SystemProgram.programId.toBase58()) {
      return 1
    }
    if (accountInfo.owner.toBase58() === TOKEN_PROGRAM_ID.toBase58()) {
      return 2
    }
    return 0
  }

  static async createTokenAccount(
    connection: Connection,
    payerAccount: Keypair,
    userAddress: PublicKey,
    tokenMintAddress: PublicKey,
  ): Promise<Keypair> {
    const transaction = new Transaction()

    const tokenAccount = Keypair.generate()

    const lamportsToInitializeAccount = await connection.getMinimumBalanceForRentExemption(INITIALIZE_ACCOUNT_SPAN)
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payerAccount.publicKey,
      newAccountPubkey: tokenAccount.publicKey,
      lamports: lamportsToInitializeAccount,
      space: INITIALIZE_ACCOUNT_SPAN,
      programId: TOKEN_PROGRAM_ID,
    })
    transaction.add(createAccountInstruction)

    const initializeTokenAccountInstruction = TokenProgramInstructionService.initializeAccount(
      userAddress,
      tokenMintAddress,
      tokenAccount.publicKey,
    )
    transaction.add(initializeTokenAccountInstruction)

    const txSign = await sendAndConfirmTransaction(connection, transaction, [
      payerAccount,
      tokenAccount,
    ])
    console.info(`Created Token Account ${tokenAccount.publicKey.toBase58()}`, '---', txSign, '\n')
    return tokenAccount
  }

  static async createTokenMint(
    connection: Connection,
    payerAccount: Keypair,
    tokenMintAccount: Keypair,
    decimals: number,
    mintAuthorityAddress: PublicKey,
    freezeAuthorityAddress: PublicKey | null,
  ): Promise<Keypair> {
    if (await SolanaService.isAddressInUse(connection, tokenMintAccount.publicKey)) {
      console.info(`SKIPPED: Token Mint ${tokenMintAccount.publicKey.toBase58()} is already existed`, '\n')
      return tokenMintAccount
    }

    const transaction = new Transaction()

    const lamportsToInitializeMint = await connection.getMinimumBalanceForRentExemption(INITIALIZE_MINT_SPAN)
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payerAccount.publicKey,
      newAccountPubkey: tokenMintAccount.publicKey,
      lamports: lamportsToInitializeMint,
      space: INITIALIZE_MINT_SPAN,
      programId: TOKEN_PROGRAM_ID,
    })
    transaction.add(createAccountInstruction)

    const initializeTokenMintInstruction = TokenProgramInstructionService.initializeMint(
      tokenMintAccount.publicKey,
      decimals,
      mintAuthorityAddress,
      freezeAuthorityAddress,
    )
    transaction.add(initializeTokenMintInstruction)

    const txSign = await sendAndConfirmTransaction(connection, transaction, [
      payerAccount,
      tokenMintAccount,
    ])
    console.info(`Created Token Mint ${tokenMintAccount.publicKey.toBase58()}`, '---', txSign, '\n')
    return tokenMintAccount
  }

  static async createNonFungibleTokenMint(
    connection: Connection,
    payerAccount: Keypair,
    tokenMintAccount: Keypair,
    initialOwnerAddress: PublicKey,
  ): Promise<Keypair> {
    if (await SolanaService.isAddressInUse(connection, tokenMintAccount.publicKey)) {
      console.info(`SKIPPED: Token Mint ${tokenMintAccount.publicKey.toBase58()} is already existed`, '\n')
      return tokenMintAccount
    }

    const transaction = new Transaction()

    const lamportsToInitializeMint = await connection.getMinimumBalanceForRentExemption(INITIALIZE_MINT_SPAN)
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payerAccount.publicKey,
      newAccountPubkey: tokenMintAccount.publicKey,
      lamports: lamportsToInitializeMint,
      space: INITIALIZE_MINT_SPAN,
      programId: TOKEN_PROGRAM_ID,
    })
    transaction.add(createAccountInstruction)

    const initialOwnerTokenAddress = await TokenProgramService.findAssociatedTokenAddress(
      initialOwnerAddress,
      tokenMintAccount.publicKey,
    )
    const createATAInstruction = await TokenProgramInstructionService.createAssociatedTokenAccount(
      payerAccount.publicKey,
      initialOwnerAddress,
      tokenMintAccount.publicKey,
    )
    transaction.add(createATAInstruction)

    const mintInstruction = TokenProgramInstructionService.mint(
      payerAccount.publicKey,
      tokenMintAccount.publicKey,
      initialOwnerTokenAddress,
      new BN(1),
    )
    transaction.add(mintInstruction)

    const disableMintAuthorityInstruction = TokenProgramInstructionService.changeAuthority(
      payerAccount.publicKey,
      tokenMintAccount.publicKey,
      0,
      null,
    )
    transaction.add(disableMintAuthorityInstruction)

    const txSign = await sendAndConfirmTransaction(connection, transaction, [
      payerAccount,
      tokenMintAccount,
    ])
    console.info(`Created Token Mint ${tokenMintAccount.publicKey.toBase58()}`, '---', txSign, '\n')
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

    const transaction = new Transaction()

    const createATAInstruction = await TokenProgramInstructionService.createAssociatedTokenAccount(
      payerAccount.publicKey,
      ownerAddress,
      tokenMintAddress,
    )
    transaction.add(createATAInstruction)

    const txSign = await sendAndConfirmTransaction(connection, transaction, [
      payerAccount,
    ])
    console.log(`Created Associated Token Account ${tokenAccountAddress.toBase58()} for Account ${ownerAddress.toBase58()}`, '---', txSign, '\n')
    return tokenAccountAddress
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

  static async findRecipientTokenAddress(
    connection: Connection,
    payerAddress: PublicKey,
    recipientAddress: PublicKey,
    tokenMintAddress: PublicKey,
  ): Promise<[PublicKey, TransactionInstruction]> {
    let recipientTokenAddress: PublicKey = recipientAddress
    let createATAInstruction: TransactionInstruction = null
    const recepientType = await this.checkAddressType(connection, recipientAddress)
    if (recepientType === 1) {
      const associatedTokenAccountAddress = await this.findAssociatedTokenAddress(
        recipientAddress,
        tokenMintAddress,
      )
      if (!await SolanaService.isAddressInUse(connection, associatedTokenAccountAddress)) {
        createATAInstruction = await TokenProgramInstructionService.createAssociatedTokenAccount(
          payerAddress,
          recipientAddress,
          tokenMintAddress,
        )
      }
      recipientTokenAddress = associatedTokenAccountAddress
    }
    return [recipientTokenAddress, createATAInstruction]
  }

  static async getTokenAccountInfo(
    connection: Connection,
    address: PublicKey
  ): Promise<TokenAccountInfo> {
    const accountInfo = await connection.getAccountInfo(address)
    const data = TokenProgramInstructionService.decodeTokenAccountInfo(accountInfo.data)
    data.address = address
    return data
  }

  static async getTokenMintInfo(
    connection: Connection,
    address: PublicKey
  ): Promise<TokenMintInfo> {
    const accountInfo = await connection.getAccountInfo(address)
    const data = TokenProgramInstructionService.decodeTokenMintInfo(accountInfo.data)
    data.address = address
    return data
  }

  static async migrateSplTokenAccounts(
    connection: Connection,
    payerAccount: Keypair,
    userAccount: Keypair,
  ): Promise<boolean> {
    const userTokenAccountsResult = await connection.getTokenAccountsByOwner(
      userAccount.publicKey,
      {
        programId: TOKEN_PROGRAM_ID,
      },
    )
    const instructions: TransactionInstruction[] = []
    const tokenAccountInfos: TokenAccountInfo[] = userTokenAccountsResult.value.map(tokenAccount => {
      const result = TokenProgramInstructionService.decodeTokenAccountInfo(tokenAccount.account.data)
      result.address = tokenAccount.pubkey
      return result
    })
    const tokenMintAddresses: PublicKey[] = tokenAccountInfos.map(account => account.mint)
      .filter((value, index, self) => {
        return self.findIndex(subValue => subValue.toBase58() === value.toBase58()) === index;
      })
    for(let i = 0; i < tokenMintAddresses.length; i++) {
      const tokenMintAddress = tokenMintAddresses[i]
      const filteredTokenAccountInfos = tokenAccountInfos.filter(accountInfo => accountInfo.mint.toBase58() === tokenMintAddress.toBase58())
      const associatedTokenAccountAddress = await TokenProgramService.findAssociatedTokenAddress(
        userAccount.publicKey,
        tokenMintAddress,
      )
      if (!filteredTokenAccountInfos.some(accountInfo => accountInfo.address.toBase58() === associatedTokenAccountAddress.toBase58())) {
        const createATAInstruction = await TokenProgramInstructionService.createAssociatedTokenAccount(
          payerAccount.publicKey,
          userAccount.publicKey,
          tokenMintAddress,
        )
        instructions.push(createATAInstruction)
      }
      for(let j = 0; j < filteredTokenAccountInfos.length; j++) {
        const tokenAccountInfo = filteredTokenAccountInfos[j]
        if (tokenAccountInfo.address.toBase58() !== associatedTokenAccountAddress.toBase58()) {
          if (tokenAccountInfo.amount.gt(new BN(0))) {
            const transferTokenInstruction = TokenProgramInstructionService.transfer(
              userAccount.publicKey,
              tokenAccountInfo.address,
              associatedTokenAccountAddress,
              tokenAccountInfo.amount,
            )
            instructions.push(transferTokenInstruction)
          }
          const closeTokenAccountInstruction = TokenProgramInstructionService.closeAccount(
            userAccount.publicKey,
            tokenAccountInfo.address,
          )
          instructions.push(closeTokenAccountInstruction)
        }
      }
    }
    if (instructions.length > 0) {
      const transaction: Transaction = new Transaction()
      transaction.instructions = instructions
      const txSign = await sendAndConfirmTransaction(connection, transaction, [
        payerAccount,
        userAccount,
      ])
      console.info(`Migrated SPL-Token accounts for ${userAccount.publicKey.toBase58()}`, '---', txSign, '\n')
      return true
    }
    console.info('Migrated SPL-Token: Nothing to do', '\n')
    return false
  }

  static async mint(
    connection: Connection,
    payerAccount: Keypair,
    tokenMintAddress: PublicKey,
    recipientAddress: PublicKey,
    amount: BN,
  ): Promise<boolean> {
    const transaction = new Transaction()

    let [recipientTokenAddress, createATAInstruction] = await this.findRecipientTokenAddress(
      connection,
      payerAccount.publicKey,
      recipientAddress,
      tokenMintAddress,
    )
    if(createATAInstruction) {
      transaction.add(createATAInstruction)
    }

    const mintInstruction = TokenProgramInstructionService.mint(
      payerAccount.publicKey,
      tokenMintAddress,
      recipientTokenAddress,
      amount,
    )
    transaction.add(mintInstruction)

    const txSign = await sendAndConfirmTransaction(connection, transaction, [
      payerAccount
    ])
    console.log(`Minted ${amount} token units to ${recipientTokenAddress.toBase58()}`, '---', txSign, '\n')
    return true
  }

  static async transfer(
    connection: Connection,
    payerAccount: Keypair,
    payerTokenAddress: PublicKey,
    recipientAddress: PublicKey,
    amount: BN,
  ): Promise<boolean> {
    const transaction = new Transaction()

    const payerTokenAccountInfo = await this.getTokenAccountInfo(
      connection,
      payerTokenAddress,
    )
    let [recipientTokenAddress, createATAInstruction] = await this.findRecipientTokenAddress(
      connection,
      payerAccount.publicKey,
      recipientAddress,
      payerTokenAccountInfo.mint,
    )
    if(createATAInstruction) {
      transaction.add(createATAInstruction)
    }

    const transferTokenInstruction = TokenProgramInstructionService.transfer(
      payerAccount.publicKey,
      payerTokenAddress,
      recipientTokenAddress,
      amount,
    )
    transaction.add(transferTokenInstruction)

    const txSign = await sendAndConfirmTransaction(connection, transaction, [
      payerAccount
    ])
    console.log(`Transferred ${amount} token units from ${payerTokenAddress.toBase58()} to ${recipientTokenAddress.toBase58()}`, '---', txSign, '\n')
    return true
  }

  static async freezeAccount(
    connection: Connection,
    authorityAccount: Keypair,
    accountAddress: PublicKey,
    mintAddress: PublicKey,
  ): Promise<boolean> {
    const transaction = new Transaction()

    const freezeAccountInstruction = TokenProgramInstructionService.freezeAccount(
      accountAddress,
      mintAddress,
      authorityAccount.publicKey
    )

    transaction.add(freezeAccountInstruction)

    const signers = [
      authorityAccount
    ]

    const txSign = await sendAndConfirmTransaction(connection, transaction, signers)
    console.log(`Freeze account ${accountAddress.toString()}`, '---', txSign, '\n')

    return true
  }

  static async thawAccount(
    connection: Connection,
    authorityAccount: Keypair,
    accountAddress: PublicKey,
    mintAddress: PublicKey,
  ): Promise<boolean> {
    const transaction = new Transaction()

    const thawAccountInstruction = TokenProgramInstructionService.thawAccount(
      accountAddress,
      mintAddress,
      authorityAccount.publicKey
    )

    transaction.add(thawAccountInstruction)

    const signers = [
      authorityAccount
    ]

    const txSign = await sendAndConfirmTransaction(connection, transaction, signers)
    console.log(`Thaw account ${accountAddress.toString()}`, '---', txSign, '\n')

    return true
  }
}

// Re-export
export { ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID } from './token_program_instruction.service'

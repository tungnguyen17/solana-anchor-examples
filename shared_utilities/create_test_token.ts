import { Connection, Keypair, sendAndConfirmTransaction } from '@solana/web3.js'
import { FileSystemService } from './filesystem.service'
import { TokenProgramService } from './token_program.service'
import { SolanaConfigService } from './solanaconfig.service'
import path from 'path'

(async function() {
  const defaultAccount = await SolanaConfigService.getDefaultAccount()
  const rpcUrl = await SolanaConfigService.getRpcUrl()
  const connection = new Connection(rpcUrl)

  const accountPath = path.join(__dirname, '..', 'shared_accounts', 'token_account.json')
  const isAccountExists = await FileSystemService.exists(accountPath)
  const tokenMintAccount = isAccountExists
    ? await SolanaConfigService.readAccountFromFile(accountPath)
    : Keypair.generate()
  if (!isAccountExists) {
    SolanaConfigService.writeAccountToFile(accountPath, tokenMintAccount)
  }

  const createTokenMintTransaction = await TokenProgramService.createInitializeMintTransaction(
    defaultAccount.publicKey,
    tokenMintAccount.publicKey,
    6,
    defaultAccount.publicKey,
    null,
  )
  await sendAndConfirmTransaction(connection, createTokenMintTransaction, [
    defaultAccount,
    tokenMintAccount
  ])
  console.log('created TokenMint')

  const createTokenAccountTransaction = await TokenProgramService.createAssociatedTokenAccountTransaction(
    defaultAccount.publicKey,
    defaultAccount.publicKey,
    tokenMintAccount.publicKey
  )
  await sendAndConfirmTransaction(connection, createTokenAccountTransaction, [
    defaultAccount,
  ])
  console.log('created TokenAccount')

  const tokenAccountAddress = await TokenProgramService.findAssociatedTokenAddress(defaultAccount.publicKey, tokenMintAccount.publicKey)
  const mintToTransaction = await TokenProgramService.createMintToTransaction(
    defaultAccount.publicKey,
    tokenMintAccount.publicKey,
    tokenAccountAddress,
    1000
  )
  await sendAndConfirmTransaction(connection, mintToTransaction, [
    defaultAccount,
  ])
  console.log('minted 1000 token units')

  const newAccount = Keypair.generate()
  const createTokenAccountTransaction2 = await TokenProgramService.createAssociatedTokenAccountTransaction(
    defaultAccount.publicKey,
    newAccount.publicKey,
    tokenMintAccount.publicKey
  )
  await sendAndConfirmTransaction(connection, createTokenAccountTransaction2, [
    defaultAccount,
  ])
  console.log('created TokenAccount 2')

  const tokenAccountAddress2 = await TokenProgramService.findAssociatedTokenAddress(newAccount.publicKey, tokenMintAccount.publicKey)
  const transferTransaction = await TokenProgramService.createTransferTransaction(
    defaultAccount.publicKey,
    tokenAccountAddress,
    tokenAccountAddress2,
    500
  )
  await sendAndConfirmTransaction(connection, transferTransaction, [
    defaultAccount,
  ])
  console.log('transferred 500 token units')
})()

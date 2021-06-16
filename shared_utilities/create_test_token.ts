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

  const createTokenAccountTransaction = await TokenProgramService.createAssociatedTokenAccount(
    defaultAccount.publicKey,
    defaultAccount.publicKey,
    tokenMintAccount.publicKey
  )
  await sendAndConfirmTransaction(connection, createTokenAccountTransaction, [
    defaultAccount,
  ])
  console.log('created TokenAccount')

})()

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
  const tokenAccount = isAccountExists
    ? await SolanaConfigService.readAccountFromFile(accountPath)
    : Keypair.generate()
  if (!isAccountExists) {
    SolanaConfigService.writeAccountToFile(accountPath, tokenAccount)
  }

  const createTokenTransaction = TokenProgramService.createInitializeMintTransaction(
    defaultAccount.publicKey,
    tokenAccount.publicKey,
    6,
    defaultAccount.publicKey,
    defaultAccount.publicKey,
  )

  await sendAndConfirmTransaction(connection, createTokenTransaction, [
    defaultAccount,
    tokenAccount
  ])
})()

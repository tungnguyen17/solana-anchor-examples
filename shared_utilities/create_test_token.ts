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

  await TokenProgramService.createTokenAccount(
    connection,
    defaultAccount,
    tokenMintAccount,
    6,
    defaultAccount.publicKey,
    null,
  )

  await TokenProgramService.createAssociatedTokenAccount(
    connection,
    defaultAccount,
    defaultAccount.publicKey,
    tokenMintAccount.publicKey
  )

  const tokenAccountAddress = await TokenProgramService.findAssociatedTokenAddress(defaultAccount.publicKey, tokenMintAccount.publicKey)
  await TokenProgramService.mint(
    connection,
    defaultAccount,
    defaultAccount,
    tokenMintAccount.publicKey,
    tokenAccountAddress,
    1000
  )

  const newAccount = Keypair.generate()
  await TokenProgramService.createAssociatedTokenAccount(
    connection,
    defaultAccount,
    newAccount.publicKey,
    tokenMintAccount.publicKey
  )

  const tokenAccountAddress2 = await TokenProgramService.findAssociatedTokenAddress(newAccount.publicKey, tokenMintAccount.publicKey)
  await TokenProgramService.trasnfer(
    connection,
    defaultAccount,
    tokenAccountAddress,
    tokenAccountAddress2,
    500
  )
})()

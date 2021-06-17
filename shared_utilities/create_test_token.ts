import { Connection, Keypair } from '@solana/web3.js'
import { SolanaConfigService } from './solana_config.service'
import { TestAccountService } from './test_account.service'
import { TokenProgramService } from './token_program.service'

(async function() {
  const defaultAccount = await SolanaConfigService.getDefaultAccount()
  const rpcUrl = await SolanaConfigService.getRpcUrl()
  const connection = new Connection(rpcUrl)

  const tokenMintAccount = await TestAccountService.getTokenAccount(17)
  const tokenMintAuthority = await TestAccountService.getAccount(17)
  await TokenProgramService.createTokenAccount(
    connection,
    defaultAccount,
    tokenMintAccount,
    6,
    tokenMintAuthority.publicKey,
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
    tokenMintAuthority,
    tokenMintAccount.publicKey,
    tokenAccountAddress,
    1000
  )

  const testAccount = await TestAccountService.getAccount(1)
  await TokenProgramService.createAssociatedTokenAccount(
    connection,
    defaultAccount,
    testAccount.publicKey,
    tokenMintAccount.publicKey
  )

  const tokenAccountAddress2 = await TokenProgramService.findAssociatedTokenAddress(testAccount.publicKey, tokenMintAccount.publicKey)
  await TokenProgramService.trasnfer(
    connection,
    defaultAccount,
    tokenAccountAddress,
    tokenAccountAddress2,
    500
  )
})()

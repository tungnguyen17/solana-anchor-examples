import { Connection } from '@solana/web3.js'
import { SolanaConfigService } from './solana_config.service'
import { SystemProgramService } from './system_program.service'
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

  const testAccount1 = await TestAccountService.getAccount(1)
  await SystemProgramService.transfer(
    connection,
    defaultAccount,
    defaultAccount,
    testAccount1.publicKey,
    500000
  )
  await TokenProgramService.createAssociatedTokenAccount(
    connection,
    defaultAccount,
    testAccount1.publicKey,
    tokenMintAccount.publicKey
  )

  const tokenAccountAddress1 = await TokenProgramService.findAssociatedTokenAddress(testAccount1.publicKey, tokenMintAccount.publicKey)
  await TokenProgramService.transfer(
    connection,
    defaultAccount,
    defaultAccount,
    tokenAccountAddress,
    tokenAccountAddress1,
    500
  )

  const testAccount2 = await TestAccountService.getAccount(2)
  await SystemProgramService.transfer(
    connection,
    defaultAccount,
    testAccount1,
    testAccount2.publicKey,
    250000
  )
  await TokenProgramService.createAssociatedTokenAccount(
    connection,
    defaultAccount,
    testAccount2.publicKey,
    tokenMintAccount.publicKey
  )

  const tokenAccountAddress2 = await TokenProgramService.findAssociatedTokenAddress(testAccount2.publicKey, tokenMintAccount.publicKey)
  await TokenProgramService.transfer(
    connection,
    defaultAccount,
    testAccount1,
    tokenAccountAddress1,
    tokenAccountAddress2,
    250
  )
})()

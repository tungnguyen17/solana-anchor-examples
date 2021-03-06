import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { TokenProgramService } from '@tforcexyz/solana-support-library'
import { SolanaConfigService, TestAccountService } from '@tforcexyz/solana-support-library/config'
import { assert } from 'chai'
import { StandaloneTokenService } from '../client/standalone_spl_token.service'

describe('standalone_spl_token_test', function() {

  const PROGRAM_ID = new PublicKey('AyBqnrH1y4U9Cqrupj3pKFYoAtoXb5RxUfoDFPUuKDrs')

  const connection = new Connection('http://localhost:8899', 'confirmed')
  let defaultAccount: Keypair
  let tokenMint1Account: Keypair
  let defaultToken1AccountAddress: PublicKey

  before(async function() {
    defaultAccount = await SolanaConfigService.getDefaultAccount()
    tokenMint1Account = await TestAccountService.getTokenAccount(100)

    await TokenProgramService.createTokenMint(
      connection,
      defaultAccount,
      tokenMint1Account,
      6,
      defaultAccount.publicKey,
      null,
    )

    defaultToken1AccountAddress = await TokenProgramService.createAssociatedTokenAccount(
      connection,
      defaultAccount,
      defaultAccount.publicKey,
      tokenMint1Account.publicKey,
    )
  })

  it('readme call success', async function() {
    await StandaloneTokenService.readme(
      connection,
      defaultAccount,
      defaultToken1AccountAddress,
      tokenMint1Account.publicKey,
      PROGRAM_ID,
    )
    assert(true)
  })
})

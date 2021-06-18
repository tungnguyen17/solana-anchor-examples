import { Program, Provider, setProvider, web3 } from '@project-serum/anchor';
import path from 'path';
import { SolanaService } from '../../shared_utilities/solana.service';
import { SolanaConfigService } from '../../shared_utilities/solana_config.service';
import { TestAccountService } from '../../shared_utilities/test_account.service';

const PROGRAM_SO_FILE_PATH = path.join('target', 'deploy', 'cross_program_invocation.so');

(async function() {
  const rpcUrl = await SolanaConfigService.getRpcUrl()
  const connection = new web3.Connection(rpcUrl, 'confirmed')
  const defaultAccount = await SolanaConfigService.getDefaultAccount()

  const programAccount = await TestAccountService.getProgramAccount(1)
  await SolanaService.deploy(connection, defaultAccount, programAccount, PROGRAM_SO_FILE_PATH)

  const anotherProgramAccount = await TestAccountService.getProgramAccount(100)
  await SolanaService.deploy(connection, defaultAccount, anotherProgramAccount, PROGRAM_SO_FILE_PATH)
})()

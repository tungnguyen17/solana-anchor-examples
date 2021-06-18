import { Program, Provider, setProvider, web3 } from '@project-serum/anchor';
import BN from 'bn.js';
import path from 'path';
import { AnchorService } from '../../shared_utilities/anchor.service';
import { SolanaConfigService } from '../../shared_utilities/solana_config.service';

const PROGRAM_IDL_FILE_PATH = path.join('target', 'idl', 'cross_program_invocation.json');
const PROGRAM_KEYPAIR_FILE_PATH = path.join('target', 'deploy', 'cross_program_invocation-keypair.json');

(async function() {
  const rpcUrl = await SolanaConfigService.getRpcUrl()
  const connection = new web3.Connection(rpcUrl, 'confirmed')
  setProvider(Provider.local(rpcUrl))

  const defaultAccount = await SolanaConfigService.getDefaultAccount()
  const programAccount = await SolanaConfigService.readAccountFromFile(PROGRAM_KEYPAIR_FILE_PATH)
  const program = await AnchorService.loadProgram(PROGRAM_IDL_FILE_PATH, programAccount.publicKey)
  await primary(program, defaultAccount)
})()

async function primary(
  program: Program,
  senderAccount: web3.Keypair,
) {
  const txSign = await program.rpc.primary({
    accounts: {
      sender: senderAccount.publicKey,
    },
  })
  console.log('Primary invoked', txSign)
}

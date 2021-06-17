import { Program, Provider, setProvider, web3 } from '@project-serum/anchor';
import { SolanaConfigService } from '../../shared_utilities/solana_config.service'
import path from 'path'
import { AnchorService } from '../../shared_utilities/anchor.service'
import BN from 'bn.js'

const PROGRAM_IDL_FILE_PATH = path.join('target', 'idl', 'indirect_transfer.json');
const PROGRAM_KEYPAIR_FILE_PATH = path.join('target', 'deploy', 'indirect_transfer-keypair.json');

(async function() {
  const rpcUrl = await SolanaConfigService.getRpcUrl()
  const connection = new web3.Connection(rpcUrl, 'confirmed')
  setProvider(Provider.local(rpcUrl))

  const defaultAccount = await SolanaConfigService.getDefaultAccount()
  const programAccount = await SolanaConfigService.readAccountFromFile(PROGRAM_KEYPAIR_FILE_PATH)
  const program = await AnchorService.loadProgram(PROGRAM_IDL_FILE_PATH, programAccount.publicKey)
  await transferSol(program, defaultAccount, programAccount.publicKey, new BN('1000'))
})()

async function transferSol(
  program: Program,
  senderAccount: web3.Keypair,
  recipientAddress: web3.PublicKey,
  amount: BN,
) {
  await program.rpc.transferSol(amount, {
    accounts: {
      sender: senderAccount.publicKey,
      recipient: recipientAddress,
      systemProgram: web3.SystemProgram.programId,
    },
    signers: [
      senderAccount,
    ]
  })
}

import { Program, Provider, setProvider, web3 } from '@project-serum/anchor';
import BN from 'bn.js';
import path from 'path';
import { AnchorService } from '../../shared_utilities/anchor.service';
import { SolanaConfigService } from '../../shared_utilities/solana_config.service';
import { TestAccountService } from '../../shared_utilities/test_account.service';

const PROGRAM_IDL_FILE_PATH = path.join('target', 'idl', 'indirect_transfer.json');
const PROGRAM_KEYPAIR_FILE_PATH = path.join('target', 'deploy', 'indirect_transfer-keypair.json');

(async function() {
  const rpcUrl = await SolanaConfigService.getRpcUrl()
  setProvider(Provider.local(rpcUrl))

  const defaultAccount = await SolanaConfigService.getDefaultAccount()
  const testAccount99 = await TestAccountService.getAccount(99)
  const programAccount = await SolanaConfigService.readAccountFromFile(PROGRAM_KEYPAIR_FILE_PATH)
  const program = await AnchorService.loadProgram(PROGRAM_IDL_FILE_PATH, programAccount.publicKey)
  await transferSol(program, defaultAccount, defaultAccount, testAccount99.publicKey, new BN('1000000'))
  // const testAccount199 = await TestAccountService.getAccount(199)
  // await transferSol(program, defaultAccount, testAccount99, testAccount199.publicKey, new BN('500000')) // This will fail
})()

async function transferSol(
  program: Program,
  payerAccount: web3.Keypair,
  senderAccount: web3.Keypair,
  recipientAddress: web3.PublicKey,
  amount: BN,
) {
  const signers = [
    payerAccount
  ]
  if (senderAccount.publicKey != payerAccount.publicKey) {
    signers.push(senderAccount)
  }
  const txSign = await program.rpc.transferSol(amount, {
    accounts: {
      payer: payerAccount.publicKey,
      sender: senderAccount.publicKey,
      recipient: recipientAddress,
      systemProgram: web3.SystemProgram.programId,
    },
    signers
  })
  console.log('TransferSOL invoked', '---', txSign, '\n')
}

import { Program, Provider, setProvider, web3 } from '@project-serum/anchor';
import path from 'path';
import { AnchorService } from '../../shared_utilities/anchor.service';
import { SolanaConfigService } from '../../shared_utilities/solana_config.service';
import { TestAccountService } from '../../shared_utilities/test_account.service';

const PROGRAM_IDL_FILE_PATH = path.join('target', 'idl', 'cross_program_invocation.json');
const PROGRAM_KEYPAIR_FILE_PATH = path.join('target', 'deploy', 'cross_program_invocation-keypair.json');

(async function() {
  const rpcUrl = await SolanaConfigService.getRpcUrl()
  const connection = new web3.Connection(rpcUrl, 'confirmed')
  setProvider(Provider.local(rpcUrl))

  const defaultAccount = await SolanaConfigService.getDefaultAccount()
  const senderAccount = await TestAccountService.getAccount(17)
  const programAccount = await SolanaConfigService.readAccountFromFile(PROGRAM_KEYPAIR_FILE_PATH)
  const program = await AnchorService.loadProgram(PROGRAM_IDL_FILE_PATH, programAccount.publicKey)
  await direct(program, defaultAccount)
  await directSigned(program, defaultAccount)
  await raw(connection, program, defaultAccount, senderAccount)
  await indirect(program, defaultAccount, programAccount)
  await indirectSigned(program, defaultAccount, programAccount)
})()

async function direct(
  program: Program,
  senderAccount: web3.Keypair,
) {
  const data = program.coder.instruction.encode('direct', {})
  console.log('Instruction', data.toJSON().data)
  const txSign = await program.rpc.direct({
    accounts: {
      sender: senderAccount.publicKey,
    }
  })
  console.log('Direct invoked', '---', txSign, '\n')
}

async function directSigned(
  program: Program,
  senderAccount: web3.Keypair,
) {
  const data = program.coder.instruction.encode('direct_signed', {})
  console.log('Instruction', data.toJSON().data)
  const txSign = await program.rpc.directSigned({
    accounts: {
      sender: senderAccount.publicKey,
    }
  })
  console.log('DirectSigned invoked', '---', txSign, '\n')
}

async function indirect(
  program: Program,
  senderAccount: web3.Keypair,
  programAccount: web3.Keypair,
  ) {
  const ixData = program.coder.instruction.encode('direct', {})
  const data = program.coder.instruction.encode('indirect', {
    destination: programAccount.publicKey,
    data: ixData,
  })
  console.log('Instruction', data.toJSON().data)
  const txSign = await program.rpc.indirect(programAccount.publicKey, ixData, {
    accounts: {
      sender: senderAccount.publicKey,
      recipient: programAccount.publicKey,
    },
  })
  console.log('Indirect invoked', '---', txSign, '\n')
}

async function indirectSigned(
  program: Program,
  senderAccount: web3.Keypair,
  programAccount: web3.Keypair,
) {
  const ixData = program.coder.instruction.encode('direct_signed', {})
  const data = program.coder.instruction.encode('indirect_signed', {
    destination: programAccount.publicKey,
    data: ixData,
  })
  console.log('Instruction', data.toJSON().data)
  const txSign = await program.rpc.indirectSigned(programAccount.publicKey, ixData, {
    accounts: {
      sender: senderAccount.publicKey,
      recipient: programAccount.publicKey,
    },
    signers: [
      senderAccount,
    ]
  })
  console.log('IndirectSigned invoked', '---', txSign, '\n')
}

async function raw(
  connection: web3.Connection,
  program: Program,
  payerAccount: web3.Keypair,
  senderAccount: web3.Keypair,
) {
  const transaction = new web3.Transaction()
  transaction.add(new web3.TransactionInstruction(<web3.TransactionInstructionCtorFields>{
    programId: program.programId,
    data: program.coder.instruction.encode('empty', {}),
    keys: [
      <web3.AccountMeta>{ pubkey: senderAccount.publicKey, isSigner: false, isWritable: false }
    ]
  }))
  const txSign = await web3.sendAndConfirmTransaction(connection, transaction, [payerAccount])
  console.log('Raw invoked', '---', txSign, '\n')
}

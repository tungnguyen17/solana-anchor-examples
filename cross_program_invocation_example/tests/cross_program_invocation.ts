import { Program, Provider, setProvider, web3 } from '@project-serum/anchor';
import path from 'path';
import { AnchorService } from '../../shared_utilities/anchor.service';
import { SolanaConfigService } from '../../shared_utilities/solana_config.service';
import { TestAccountService } from '../../shared_utilities/test_account.service';

const PROGRAM_IDL_FILE_PATH = path.join('target', 'idl', 'cross_program_invocation.json');

(async function() {
  const rpcUrl = await SolanaConfigService.getRpcUrl()
  const connection = new web3.Connection(rpcUrl, 'confirmed')
  setProvider(Provider.local(rpcUrl))

  const defaultAccount = await SolanaConfigService.getDefaultAccount()
  const programAccount = await TestAccountService.getProgramAccount(1)
  const anotherProgramAccount = await TestAccountService.getProgramAccount(101)
  const program = await AnchorService.loadProgram(PROGRAM_IDL_FILE_PATH, programAccount.publicKey)
  await direct(program, defaultAccount)
  await directSigned(program, defaultAccount)
  await indirect(program, defaultAccount, anotherProgramAccount)
  await indirectSigned(program, defaultAccount, anotherProgramAccount)
  await raw(connection, program, defaultAccount)
})()

async function direct(
  program: Program,
  senderAccount: web3.Keypair,
) {
  const txSign = await program.rpc.direct({
    accounts: {
      sender: senderAccount.publicKey,
    }
  })
  console.log('Direct invoked', txSign)
  const data = program.coder.instruction.encode('direct', {})
  console.log('Instruction', data.toJSON().data)
}

async function directSigned(
  program: Program,
  senderAccount: web3.Keypair,
) {
  const txSign = await program.rpc.directSigned({
    accounts: {
      sender: senderAccount.publicKey,
    }
  })
  console.log('DirectSigned invoked', txSign)
  const data = program.coder.instruction.encode('direct_signed', {})
  console.log('Instruction', data.toJSON().data)
}

async function indirect(
  program: Program,
  senderAccount: web3.Keypair,
  programAccount: web3.Keypair,
  ) {
  const txSign = await program.rpc.indirect({
    accounts: {
      sender: senderAccount.publicKey,
      programId: programAccount.publicKey,
    },
  })
  console.log('Indirect invoked', txSign)
  const data = program.coder.instruction.encode('indirect', {})
  console.log('Instruction', data.toJSON().data)
}

async function indirectSigned(
  program: Program,
  senderAccount: web3.Keypair,
  programAccount: web3.Keypair,
) {
  const txSign = await program.rpc.indirectSigned({
    accounts: {
      sender: senderAccount.publicKey,
      programId: programAccount.publicKey,
    },
    signers: [
      senderAccount,
    ]
  })
  console.log('IndirectSigned invoked', txSign)
  const data = program.coder.instruction.encode('indirect_signed', {})
  console.log('Instruction', data.toJSON().data)
}

async function raw(
  connection: web3.Connection,
  program: Program,
  senderAccount: web3.Keypair,
) {
  const transaction = new web3.Transaction()
  transaction.add(new web3.TransactionInstruction(<web3.TransactionInstructionCtorFields>{
    programId: program.programId,
    data: Buffer.from([194,  97, 216,  87, 114, 193, 179, 121]),
    keys: [
      <web3.AccountMeta>{ pubkey: senderAccount.publicKey, isSigner: false, isWritable: false }
    ]
  }))
  const txSign = await web3.sendAndConfirmTransaction(connection, transaction, [senderAccount])
  console.log('Raw invoked', txSign)
}

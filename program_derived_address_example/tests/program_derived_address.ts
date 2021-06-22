import { Program, web3 } from '@project-serum/anchor';
import path from 'path';
import { AnchorService } from '../../shared_utilities/anchor.service';
import { SolanaConfigService } from '../../shared_utilities/solana_config.service';
import { SystemProgramService } from '../../shared_utilities/system_program.service';
import { TestAccountService } from '../../shared_utilities/test_account.service';
import { TokenProgramService } from '../../shared_utilities/token_program.service';
import { TokenProgramInstructionService, TOKEN_PROGRAM_ID } from '../../shared_utilities/token_program_instruction.service';

const PROGRAM_IDL_FILE_PATH = path.join('target', 'idl', 'program_derived_address.json');
const PROGRAM_KEYPAIR_FILE_PATH = path.join('target', 'deploy', 'program_derived_address-keypair.json');

(async function() {
  const rpcUrl = await SolanaConfigService.getRpcUrl()
  const connection = new web3.Connection(rpcUrl, 'confirmed')
  const defaultAccount = await SolanaConfigService.getDefaultAccount()
  const programAccount = await SolanaConfigService.readAccountFromFile(PROGRAM_KEYPAIR_FILE_PATH)
  const program = await AnchorService.loadProgram(PROGRAM_IDL_FILE_PATH, programAccount.publicKey)
  const tokenMintAccount = await TestAccountService.getTokenAccount(17)

  const derivedWalletSeed = Buffer.from('SOL', 'utf-8')
  const [derivedWalletAddress, derivedWalletNonce] = await web3.PublicKey.findProgramAddress([derivedWalletSeed], programAccount.publicKey)
  console.log('Derived SOL wallet: ', derivedWalletAddress.toBase58(), derivedWalletNonce, '\n')
  const testWalletAddress = await web3.PublicKey.createProgramAddress([derivedWalletSeed, Buffer.from([derivedWalletNonce])], programAccount.publicKey)
  console.log('Test SOL wallet: ', testWalletAddress.toBase58(), '\n')

  await empty(program, derivedWalletSeed, derivedWalletNonce)
  await SystemProgramService.transfer(
    connection,
    defaultAccount,
    defaultAccount,
    derivedWalletAddress,
    500000
  )
  await transferSol(program, derivedWalletAddress, defaultAccount.publicKey, 100, derivedWalletSeed, derivedWalletNonce)

  const tokenMintAuthority = await TestAccountService.getAccount(17)
  const tokenAccountAddress = await TokenProgramService.findAssociatedTokenAddress(defaultAccount.publicKey, tokenMintAccount.publicKey)
  const derivedTokenAddress = await TokenProgramService.createAssociatedTokenAccount(connection, defaultAccount, derivedWalletAddress, tokenMintAccount.publicKey)
  await TokenProgramService.mint(
    connection,
    defaultAccount,
    tokenMintAuthority,
    tokenMintAccount.publicKey,
    derivedTokenAddress,
    10000
  )
  await transferToken(program, derivedWalletAddress, derivedTokenAddress, tokenAccountAddress, 100, derivedWalletSeed, derivedWalletNonce)
})()

async function empty(
  program: Program,
  seed: Buffer,
  nonce: number,
) {
  const instruction = program.coder.instruction.encode('empty', {})
  await forward(
    program,
    program.programId,
    [],
    instruction,
    seed,
    nonce,
    [],
    [],
  )
}

async function transferSol(
  program: Program,
  programSolWallet: web3.PublicKey,
  recipientAddress: web3.PublicKey,
  amount: number,
  seed: Buffer,
  nonce: number,
) {
  const instruction = web3.SystemProgram.transfer({
    fromPubkey: programSolWallet,
    toPubkey: recipientAddress,
    lamports: amount,
  })
  await forward(
    program,
    web3.SystemProgram.programId,
    instruction.keys,
    instruction.data,
    seed,
    nonce,
    [
      <web3.AccountMeta>{ pubkey: programSolWallet, isSigner: false, isWritable: true },
      <web3.AccountMeta>{ pubkey: recipientAddress, isSigner: false, isWritable: true },
    ],
    [],
  )
}

async function transferToken(
  program: Program,
  programDerivedAddress: web3.PublicKey,
  programTokenAddress: web3.PublicKey,
  recipientTokenAddress: web3.PublicKey,
  amount: number,
  seed: Buffer,
  nonce: number,
) {
  const transaction = await TokenProgramInstructionService.createTransferTransaction(
    programDerivedAddress,
    programTokenAddress,
    recipientTokenAddress,
    amount,
  )
  const instruction = transaction.instructions[0]
  await forward(
    program,
    TOKEN_PROGRAM_ID,
    instruction.keys,
    instruction.data,
    seed,
    nonce,
    [
      <web3.AccountMeta>{ pubkey: programDerivedAddress, isSigner: false, isWritable: false },
      <web3.AccountMeta>{ pubkey: programTokenAddress, isSigner: false, isWritable: true },
      <web3.AccountMeta>{ pubkey: recipientTokenAddress, isSigner: false, isWritable: true },
    ],
    [],
  )
}

async function forward(
  program: Program,
  destinationAddress: web3.PublicKey,
  forwardedAccounts: web3.AccountMeta[],
  data: Buffer,
  seed: Buffer,
  nonce: number,
  accounts: web3.AccountMeta[],
  signers: [],
  ) {
  const txSign = await program.rpc.forward(forwardedAccounts, data, seed, nonce, {
    accounts: {
      destination: destinationAddress
    },
    remainingAccounts: accounts,
    signers,
  })
  console.log('Forward invoked', '---', txSign, '\n')
}

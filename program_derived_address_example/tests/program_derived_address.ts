import { Program, Provider, setProvider, web3 } from '@project-serum/anchor';
import path from 'path';
import { AnchorService } from '../../shared_utilities/anchor.service';
import { SolanaConfigService } from '../../shared_utilities/solana_config.service';

const PROGRAM_IDL_FILE_PATH = path.join('target', 'idl', 'program_derived_address.json');
const PROGRAM_KEYPAIR_FILE_PATH = path.join('target', 'deploy', 'program_derived_address-keypair.json');

(async function() {
  const rpcUrl = await SolanaConfigService.getRpcUrl()
  const defaultAccount = await SolanaConfigService.getDefaultAccount()
  const programAccount = await SolanaConfigService.readAccountFromFile(PROGRAM_KEYPAIR_FILE_PATH)
  const program = await AnchorService.loadProgram(PROGRAM_IDL_FILE_PATH, programAccount.publicKey)

  const solWalletSeed = Buffer.from('SOL', 'utf-8')
  const [solWalletAddress, solWalletNonce] = await web3.PublicKey.findProgramAddress([solWalletSeed], programAccount.publicKey)
  console.log('Derived SOL wallet: ', solWalletAddress.toBase58(), solWalletNonce, '\n')
  console.log('Is on curve: ', defaultAccount.publicKey.toBase58(), web3.PublicKey.isOnCurve(defaultAccount.publicKey.toBytes()), '\n')
  console.log('Is on curve: ', solWalletAddress.toBase58(), web3.PublicKey.isOnCurve(solWalletAddress.toBytes()), '\n')
  const testWalletAddress = await web3.PublicKey.createProgramAddress([solWalletSeed, Buffer.from([solWalletNonce])], programAccount.publicKey)
  console.log('Test SOL wallet: ', testWalletAddress.toBase58(), '\n')
  console.log(`Computed seed: [[${solWalletSeed.toJSON().data}],[${solWalletNonce}]]`, '\n')

  await empty(program, solWalletSeed, solWalletNonce)
  await transferSol(program, solWalletAddress, defaultAccount.publicKey, 100, solWalletSeed, solWalletNonce)
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

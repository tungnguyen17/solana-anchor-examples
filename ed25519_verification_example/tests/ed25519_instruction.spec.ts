import {
  Connection,
  Keypair,
  Transaction
} from '@solana/web3.js';
import {
  Ed25519InstructionService,
  sendTransaction
} from '@tforcexyz/solana-support-library';
import { SolanaConfigService, TestAccountService } from '@tforcexyz/solana-support-library/config';
import { SignMessageParams } from '@tforcexyz/solana-support-library/ed25519_instruction.service';

describe('ed25519_program_instruction_test', function() {

  const connection = new Connection('http://localhost:8899', 'confirmed');
  let defaultAccount: Keypair;

  before(async function() {
    defaultAccount = await SolanaConfigService.getDefaultAccount();
  });

  it('verify_1_signature', async function() {
    const transaction = new Transaction();

    const data = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const instruction = Ed25519InstructionService.signAndCreateMessageVerification(
      Buffer.from(data),
      defaultAccount,
    );
    transaction.add(instruction);

    const txSign = await sendTransaction(
      connection,
      transaction,
      [
        defaultAccount,
      ],
    );
    console.info(`Verified signature --- ${txSign}`);
  })

  it('verify_2_signatures', async function() {
    const transaction = new Transaction();
    const testAccount0 = await TestAccountService.getAccount(0);

    const data = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const instruction = Ed25519InstructionService.signAndCreateMessageVerification(
      Buffer.from(data),
      defaultAccount,
      testAccount0,
    );
    transaction.add(instruction);

    const txSign = await sendTransaction(
      connection,
      transaction,
      [
        defaultAccount,
      ],
    );
    console.info(`Verified signature --- ${txSign}`);
  })

  it('verify_1_messages', async function() {
    const transaction = new Transaction();

    const message1 = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const instruction = Ed25519InstructionService.signAndCreateMessagesVerification(
      <SignMessageParams>{
        message: message1,
        signer: defaultAccount,
      },
    );
    transaction.add(instruction);

    const txSign = await sendTransaction(
      connection,
      transaction,
      [
        defaultAccount,
      ],
    );
    console.info(`Verified signature --- ${txSign}`);
  })



  it('verify_2_messages', async function() {
    const transaction = new Transaction();
    const testAccount0 = await TestAccountService.getAccount(0);

    const message1 = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);
    const message2 = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const instruction = Ed25519InstructionService.signAndCreateMessagesVerification(
      <SignMessageParams>{
        message: message1,
        signer: defaultAccount,
      },
      <SignMessageParams>{
        message: message2,
        signer: testAccount0,
      },
    );
    transaction.add(instruction);

    const txSign = await sendTransaction(
      connection,
      transaction,
      [
        defaultAccount,
      ],
    );
    console.info(`Verified signature --- ${txSign}`);
  })
})

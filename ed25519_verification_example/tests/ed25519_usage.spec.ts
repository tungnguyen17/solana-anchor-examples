import {
  Connection,
  Ed25519Program,
  Keypair,
  Transaction
} from '@solana/web3.js';
import { sendTransaction } from '@tforcexyz/solana-support-library';
import { SolanaConfigService, TestAccountService } from '@tforcexyz/solana-support-library/config';
import { Ed25519InstructionService } from '../services/ed25519_instruction.service';

describe('ed25519_program_usage_test', function() {

  const connection = new Connection('http://localhost:8899', 'confirmed');
  let defaultAccount: Keypair;

  before(async function() {
    defaultAccount = await SolanaConfigService.getDefaultAccount();
  });

  it('verify_1_signature', async function() {
    const transaction = new Transaction();

    const data = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const instruction = Ed25519InstructionService.verify(
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
    const instruction = Ed25519InstructionService.verify(
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
})

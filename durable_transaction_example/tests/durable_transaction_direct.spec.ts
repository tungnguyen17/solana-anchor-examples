import {
  Connection,
  Keypair,
  PublicKey
} from '@solana/web3.js';
import {
  SolanaConfigService,
  TestAccountService
} from '@tforcexyz/solana-support-library/config';
import { expect } from 'chai';
import { DurableTransactionService } from '../client/durable_transaction.service';

describe('durable_transaction_direct_test', function() {

  const PROGRAM_ID = new PublicKey('BF9NFCCtkETvj44iWzTQLKA2DSYr7h34hgdDJGEmnX6t');
  const connection = new Connection('http://localhost:8899', 'confirmed');
  let defaultAccount: Keypair;

  before(async function() {
    defaultAccount = await SolanaConfigService.getDefaultAccount();
  });

  it('invoke_with_0_signer', async function() {
    const signerCount = await DurableTransactionService.invoke(
      connection,
      defaultAccount,
      [],
      [],
      false,
      PROGRAM_ID,
    );

    expect(signerCount).equal(0);
  });

  it('invoke_with_2_signers', async function() {
    const testAccount1 = await TestAccountService.getAccount(1);
    const testAccount2 = await TestAccountService.getAccount(2);

    const signerCount = await DurableTransactionService.invoke(
      connection,
      defaultAccount,
      [
        testAccount1.publicKey,
        testAccount2.publicKey,
      ],
      [
        testAccount1,
        testAccount2,
      ],
      false,
      PROGRAM_ID,
    );

    expect(signerCount).equal(2);
  });

  it('invoke_with_3_signers', async function() {
    const testAccount1 = await TestAccountService.getAccount(1);
    const testAccount2 = await TestAccountService.getAccount(2);
    const testAccount3 = await TestAccountService.getAccount(3);

    const signerCount = await DurableTransactionService.invoke(
      connection,
      defaultAccount,
      [
        testAccount1.publicKey,
        testAccount2.publicKey,
        testAccount3.publicKey,
      ],
      [
        testAccount3,
        testAccount2,
        testAccount1,
      ],
      false,
      PROGRAM_ID,
    );

    expect(signerCount).equal(3);
  });

  it('invoke_with_2_signers_and_1_non_signer', async function() {
    const testAccount1 = await TestAccountService.getAccount(1);
    const testAccount2 = await TestAccountService.getAccount(2);
    const testAccount3 = await TestAccountService.getAccount(3);

    const signerCount = await DurableTransactionService.invoke(
      connection,
      defaultAccount,
      [
        testAccount1.publicKey,
        testAccount2.publicKey,
        testAccount3.publicKey,
      ],
      [
        testAccount1,
        testAccount2,
      ],
      false,
      PROGRAM_ID,
    );

    expect(signerCount).equal(2);
  });

  it('invoke_with_duplicate_signer', async function() {
    const testAccount1 = await TestAccountService.getAccount(1);
    const testAccount2 = await TestAccountService.getAccount(2);
    const testAccount3 = await TestAccountService.getAccount(3);

    const signerCount = await DurableTransactionService.invoke(
      connection,
      defaultAccount,
      [
        testAccount1.publicKey,
        testAccount2.publicKey,
        testAccount3.publicKey,
        testAccount2.publicKey,
      ],
      [
        testAccount1,
        testAccount2,
        testAccount3,
      ],
      false,
      PROGRAM_ID,
    );

    expect(signerCount).equal(4);
  });
})

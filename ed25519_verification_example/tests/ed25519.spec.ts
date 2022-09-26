import {
  Connection,
  Keypair,
  PublicKey
} from '@solana/web3.js';
import {
  HashService
} from '@tforcexyz/solana-support-library';
import { SolanaConfigService, TestAccountService } from '@tforcexyz/solana-support-library/config';
import { expect } from 'chai';
import { Ed25519VerificationService } from '../client/ed25519_verification.service';

describe('ed25519_verification_test', function() {

  const PROGRAM_ID = new PublicKey('ed25yCKPyfYZh6moATb2K6MJhnkbsiiFzi2sCPKeNuC');
  const connection = new Connection('http://localhost:8899', 'confirmed');
  let defaultAccount: Keypair;

  before(async function() {
    defaultAccount = await SolanaConfigService.getDefaultAccount();
  });

  it('compare_1_signature', async function() {
    const message = 'Hello World';
    const messageHash = HashService.sha256(message);

    await Ed25519VerificationService.compareMessageSignature(
      connection,
      defaultAccount,
      messageHash,
      [
        defaultAccount,
      ],
      PROGRAM_ID,
    );
  });

  it('compare_2_signatures', async function() {
    const testAccount0 = await TestAccountService.getAccount(0);
    const message = 'High Definition';
    const messageHash = HashService.sha256(message);

    await Ed25519VerificationService.compareMessageSignature(
      connection,
      defaultAccount,
      messageHash,
      [
        defaultAccount,
        testAccount0,
      ],
      PROGRAM_ID,
    );
  });

  it('validate_1_signature', async function() {
    const message = 'Hello World';
    const messageHash = HashService.sha256(message);

    const signerCount = await Ed25519VerificationService.verifyMessageSignature(
      connection,
      defaultAccount,
      messageHash,
      [
        defaultAccount,
      ],
      PROGRAM_ID,
    );

    expect(signerCount).equal(1);
  });

  it('validate_2_signatures', async function() {
    const testAccount0 = await TestAccountService.getAccount(0);
    const message = 'High Definition';
    const messageHash = HashService.sha256(message);

    const signerCount = await Ed25519VerificationService.verifyMessageSignature(
      connection,
      defaultAccount,
      messageHash,
      [
        defaultAccount,
        testAccount0,
      ],
      PROGRAM_ID,
    );

    expect(signerCount).equal(2);
  });
})

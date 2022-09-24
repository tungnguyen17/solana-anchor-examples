import {
  Connection,
  Keypair,
  PublicKey
} from '@solana/web3.js';
import {
  HashService
} from '@tforcexyz/solana-support-library';
import { SolanaConfigService, TestAccountService } from '@tforcexyz/solana-support-library/config';
import { Ed25519VerificationService } from '../client/ed25519_verification.service';

describe('ed25519_verification_test', function() {

  const PROGRAM_ID = new PublicKey('ed25yCKPyfYZh6moATb2K6MJhnkbsiiFzi2sCPKeNuC');
  const connection = new Connection('http://localhost:8899', 'confirmed');
  let defaultAccount: Keypair;

  before(async function() {
    defaultAccount = await SolanaConfigService.getDefaultAccount();
  });

  it('validate_1_signature', async function() {
    const message = 'Hello World';
    const messageHash = HashService.sha256(message);

    await Ed25519VerificationService.verifyMessageSignature(
      connection,
      defaultAccount,
      messageHash,
      [
        defaultAccount,
      ],
      PROGRAM_ID,
    );
  });

  it('validate_2_signature', async function() {
    const testAccount0 = await TestAccountService.getAccount(0);
    const message = 'High Definition';
    const messageHash = HashService.sha256(message);

    await Ed25519VerificationService.verifyMessageSignature(
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
})

import {
  Connection,
  Keypair,
  PublicKey
} from '@solana/web3.js';
import {
  SolanaConfigService,
  TestAccountService
} from '@tforcexyz/solana-support-library/config';
import BN from 'bn.js';
import { Base64TransformService } from '../client/base64_transform.service';

describe('base64_encode_test', function() {

  const PROGRAM_ID = new PublicKey('b64kZKyW4VzaRRsKecKxhJfPzxcjrx4M3rK3wq8ZuFw');

  const connection = new Connection('http://localhost:8899', 'confirmed');
  let testAccount5: Keypair;
  let defaultAccount: Keypair;

  before(async function() {
    defaultAccount = await SolanaConfigService.getDefaultAccount();
    testAccount5 = await TestAccountService.getAccount(5);
  });

  it('encode', async function() {
    const timestamp = new BN('12345678');

    await Base64TransformService.encode(
      connection,
      defaultAccount,
      testAccount5.publicKey,
      timestamp,
      PROGRAM_ID,
    );
  });
});

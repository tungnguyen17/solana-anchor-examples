import {
  Connection,
  Keypair,
  PublicKey
} from '@solana/web3.js';
import {
  SolanaService
} from '@tforcexyz/solana-support-library';
import {
  SolanaConfigService,
  TestAccountService
} from '@tforcexyz/solana-support-library/config';
import BN from 'bn.js';
import { Base64TransformInstruction } from '../client/base64_transform.instruction';
import { Base64TransformService } from '../client/base64_transform.service';

describe('base64_decode_test', function() {

  const PROGRAM_ID = new PublicKey('b64kZKyW4VzaRRsKecKxhJfPzxcjrx4M3rK3wq8ZuFw');

  const connection = new Connection('http://localhost:8899', 'confirmed');
  let testAccount5: Keypair;
  let defaultAccount: Keypair;

  before(async function() {
    defaultAccount = await SolanaConfigService.getDefaultAccount();
    testAccount5 = await TestAccountService.getAccount(5);
  });

  it('decode', async function() {
    const timestamp = new BN('12345678');
    const messageBase64Buffer = Base64TransformInstruction.encodeMessage(
      testAccount5.publicKey,
      timestamp,
    );

    await Base64TransformService.decode(
      connection,
      defaultAccount,
      messageBase64Buffer,
      PROGRAM_ID,
    );
  });
});

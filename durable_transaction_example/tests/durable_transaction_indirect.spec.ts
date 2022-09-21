import {
  Connection,
  Keypair,
  PublicKey,
  SignaturePubkeyPair,
  Transaction
} from '@solana/web3.js';
import {
  SolanaConfigService,
  TestAccountService
} from '@tforcexyz/solana-support-library/config';
import { DurableTransactionService } from '../client/durable_transaction.service';

describe('durable_transaction_indirect_test', function() {

  const PROGRAM_ID = new PublicKey('BF9NFCCtkETvj44iWzTQLKA2DSYr7h34hgdDJGEmnX6t');
  const connection = new Connection('http://localhost:8899', 'confirmed');
  let defaultAccount: Keypair;

  before(async function() {
    defaultAccount = await SolanaConfigService.getDefaultAccount();
  });

  it('invoke_with_2_signers', async function() {
    const testAccount1 = await TestAccountService.getAccount(1);
    const testAccount2 = await TestAccountService.getAccount(2);

    const rawTransaction = await DurableTransactionService.createDurableTransaction(
      connection,
      defaultAccount,
      [
        testAccount1.publicKey,
        testAccount2.publicKey,
      ],
      false,
      PROGRAM_ID,
    );

    const signature1 = DurableTransactionService.approveTransaction(rawTransaction, testAccount1);
    const signature2 = DurableTransactionService.approveTransaction(rawTransaction, testAccount2);

    const txSign = await sendRawTransaction(
      connection,
      rawTransaction, [
        { publicKey: testAccount1.publicKey, signature: signature1 },
        { publicKey: testAccount2.publicKey, signature: signature2 },
      ]
    );

    console.info(`Invoke call with 2 signers --- ${txSign}`);
  });
})

async function sendRawTransaction(
  connection: Connection,
  rawTransaction: Buffer,
  signatures: SignatureTuple[],
): Promise<string> {
  const transaction = Transaction.from(rawTransaction);
  for(let signature of signatures) {
    transaction.addSignature(signature.publicKey, signature.signature);
  }

  return connection.sendRawTransaction(transaction.serialize());
}

interface SignatureTuple {
  publicKey: PublicKey
  signature: Buffer
}

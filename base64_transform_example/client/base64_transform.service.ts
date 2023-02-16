import {
  Connection,
  Keypair,
  PublicKey,
  Transaction
} from '@solana/web3.js';
import {
  executeTransaction
} from '@tforcexyz/solana-support-library';
import BN from 'bn.js';
import {
  Base64TransformInstruction
} from './base64_transform.instruction';

export class Base64TransformService {

  static async decode(
    connection: Connection,
    payerAccount: Keypair,
    messageBase64Buffer: Buffer,
    base64TransformProgramId: PublicKey,
  ): Promise<string> {

    const transaction = new Transaction();

    const decodeInstruction = Base64TransformInstruction.decode(
      messageBase64Buffer,
      base64TransformProgramId,
    );
    transaction.add(decodeInstruction);

    const signers = [
      payerAccount,
    ];

    const txSign = await executeTransaction(connection, transaction, signers);

    console.info(`Invoke successful`, '---', txSign, '\n');
    return txSign;
  }

  static async encode(
    connection: Connection,
    payerAccount: Keypair,
    sender: PublicKey,
    timestamp: BN,
    base64TransformProgramId: PublicKey,
  ): Promise<string> {

    const transaction = new Transaction();

    const encodeInstruction = Base64TransformInstruction.encode(
      sender,
      timestamp,
      base64TransformProgramId,
    );
    transaction.add(encodeInstruction);

    const signers = [
      payerAccount,
    ];

    const txSign = await executeTransaction(connection, transaction, signers);

    console.info(`Invoke successful`, '---', txSign, '\n');
    return txSign;
  }
}

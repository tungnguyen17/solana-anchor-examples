import {
  Connection,
  Keypair,
  PublicKey,
  Transaction
} from '@solana/web3.js';
import {
  Ed25519InstructionService,
  Ed25519SignService,
  executeTransaction,
  SignatureTuple
} from '@tforcexyz/solana-support-library';
import { Ed25519VerificationInstructionService } from './ed25519_verification_instruction.service';

export class Ed25519VerificationService {

  static async compareMessageSignature(
    connection: Connection,
    payerAccount: Keypair,
    message: Buffer,
    signers: Keypair[],
    ed25519VerifyProgramId: PublicKey,
  ): Promise<void> {

    const transaction = new Transaction();

    const signatures = signers.map(signer => {
      const signatureBuffer = Ed25519SignService.signMessage(
        message,
        Buffer.from(signer.secretKey),
      );
      return <SignatureTuple>{
        publicKey: signer.publicKey,
        signature: signatureBuffer,
      };
    });

    const createSignatureInstruction = Ed25519InstructionService.signAndCreateMessageVerification(
      message,
      ...signers,
    );
    const compareMessageSignatureInstruction = Ed25519VerificationInstructionService.compareMessageSignature(
      message,
      signatures,
      createSignatureInstruction.data,
      ed25519VerifyProgramId,
    );
    transaction.add(compareMessageSignatureInstruction);

    transaction.feePayer = payerAccount.publicKey;

    const txSign = await executeTransaction(
      connection,
      transaction,
      [
        payerAccount,
      ],
    );

    console.info(`Verified message signature generation --- ${txSign}`);
  }

  static async verifyMessageSignature(
    connection: Connection,
    payerAccount: Keypair,
    message: Buffer,
    signers: Keypair[],
    ed25519VerifyProgramId: PublicKey,
  ): Promise<number> {

    const transaction = new Transaction();

    const messageVerificationInstruction = Ed25519InstructionService.signAndCreateMessageVerification(
      message,
      ...signers,
    );
    transaction.add(messageVerificationInstruction);

    const counterAccount = Keypair.generate();
    const createCounterInstruction = Ed25519VerificationInstructionService.createCounter(
      payerAccount.publicKey,
      counterAccount.publicKey.toBuffer(),
      ed25519VerifyProgramId,
    );
    transaction.add(createCounterInstruction);

    const counterAddress = Ed25519VerificationInstructionService.findCounterAddress(
      counterAccount.publicKey.toBuffer(),
      ed25519VerifyProgramId,
    );

    const signatures = signers.map(signer => {
      const signatureBuffer = Ed25519SignService.signMessage(
        message,
        Buffer.from(signer.secretKey),
      );
      return <SignatureTuple>{
        publicKey: signer.publicKey,
        signature: signatureBuffer,
      };
    });

    const verifyMessageSignatureInstruction = Ed25519VerificationInstructionService.validateMessageSignature(
      message,
      signatures,
      counterAddress,
      ed25519VerifyProgramId,
    );
    transaction.add(verifyMessageSignatureInstruction);

    transaction.feePayer = payerAccount.publicKey;

    const txSign = await executeTransaction(
      connection,
      transaction,
      [
        payerAccount,
      ],
    );

    let counterAccountInfo = await connection.getAccountInfo(counterAddress);
    let signerCount = -1;
    if (counterAccountInfo) {
      const counterAccountData = Ed25519VerificationInstructionService.decodeCounterAccount(counterAccountInfo.data);
      signerCount = counterAccountData.signerCount;
    }

    console.info(`Verified message with ${signerCount} signers --- ${txSign}`);

    return signerCount;
  }
}

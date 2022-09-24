import {
  Connection,
  Keypair,
  PublicKey,
  Transaction
} from '@solana/web3.js';
import {
  Ed25519InstructionService,
  Ed25519SignService,
  sendTransaction,
  SignatureTuple
} from '@tforcexyz/solana-support-library';
import { Ed25519VerificationInstructionService } from './ed25519_verification_instruction.service';

export class Ed25519VerificationService {

  static async verifyMessageSignature(
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
    })

    const createSignatureInstruction = Ed25519InstructionService.signAndCreateMessageVerification(
      message,
      ...signers,
    );
    const verifyMessageSignatureInstruction = Ed25519VerificationInstructionService.validateMessageSignature(
      message,
      signatures,
      createSignatureInstruction.data,
      ed25519VerifyProgramId,
    );
    transaction.add(verifyMessageSignatureInstruction);

    transaction.feePayer = payerAccount.publicKey;

    const txSign = await sendTransaction(
      connection,
      transaction,
      [
        payerAccount,
      ],
    );

    console.info(`Verified message signature --- ${txSign}`);
  }
}

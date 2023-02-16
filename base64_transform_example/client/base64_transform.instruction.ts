import {
  BorshCoder,
  Idl
} from '@project-serum/anchor';
import * as borsh from '@project-serum/borsh';
import {
  AccountMeta,
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';
import { BorshService } from '@tforcexyz/solana-support-library';
import BN from 'bn.js';
import {
  BASE64_TRANSFORM_IDL
} from './base64_transform.idl';

const coder = new BorshCoder(BASE64_TRANSFORM_IDL as Idl);

interface DecodeRequest {
  messageBase64Buffer: Buffer,
}

interface EncodeRequest {
  sender: PublicKey,
  timestamp: BN,
}

interface MessageInfo {
  sender: PublicKey,
  timestamp: BN,
}

const MESSAGE_INFO_LAYOUT = borsh.struct([
  borsh.publicKey('sender'),
  borsh.i64('timestamp'),
]);

export class Base64TransformInstruction {

  static decode(
    messageBase64Buffer: Buffer,
    base64TransformProgramId: PublicKey,
  ): TransactionInstruction {

    const request: DecodeRequest = {
      messageBase64Buffer,
    };
    const data = coder.instruction.encode('decode', request);

    const keys: AccountMeta[] = [
    ];

    return new TransactionInstruction({
      data,
      keys,
      programId: base64TransformProgramId,
    });
  }

  static encode(
    sender: PublicKey,
    timestamp: BN,
    base64TransformProgramId: PublicKey,
  ): TransactionInstruction {

    const request = <EncodeRequest>{
      sender,
      timestamp,
    };
    const data = coder.instruction.encode('encode', request);

    const keys: AccountMeta[] = [
    ];

    return new TransactionInstruction({
      data,
      keys,
      programId: base64TransformProgramId,
    });
  }

  static decodeMessage(
    sender: PublicKey,
    timestamp: BN,
  ): Buffer {
    const messageBuffer = BorshService.serialize(
      MESSAGE_INFO_LAYOUT,
      <MessageInfo>{
        sender,
        timestamp,
      },
      40,
    );
    const messageBase64 = messageBuffer.toString('base64');
    const messageBase64Buffer = Buffer.from(new TextEncoder().encode(messageBase64));
    return messageBase64Buffer;
  }

  static encodeMessage(
    sender: PublicKey,
    timestamp: BN,
  ): Buffer {
    const messageBuffer = BorshService.serialize(
      MESSAGE_INFO_LAYOUT,
      <MessageInfo>{
        sender,
        timestamp,
      },
      40,
    );
    const messageBase64 = messageBuffer.toString('base64');
    const messageBase64Buffer = Buffer.from(new TextEncoder().encode(messageBase64));
    return messageBase64Buffer;
  }
}

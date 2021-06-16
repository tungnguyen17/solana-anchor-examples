import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import * as BufferLayout from './buffer-layout'
import * as ExtendedLayout from './extended_layout'
import { HashService } from './hash.service'

const MULTISIG_LAYOUT = BufferLayout.union(BufferLayout.greedy(1, 'instruction'))
MULTISIG_LAYOUT.addVariant(
  0,
  BufferLayout.struct([
  ]),
  'foo'
)

MULTISIG_LAYOUT.addVariant(
  1,
  BufferLayout.struct([
    BufferLayout.u16('amount')
  ]),
  'fooWithFriend'
)

MULTISIG_LAYOUT.addVariant(
  3,
  BufferLayout.struct([
    BufferLayout.seq(
      BufferLayout.u16(),
      BufferLayout.greedy(4),
      'votePowers'
    ),
    BufferLayout.u16('requiredVote'),
  ]),
  'changeOwners'
)

const TOKEN_PROGRAM_LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'))
TOKEN_PROGRAM_LAYOUT.addVariant(
  0,
  BufferLayout.struct([
    BufferLayout.u8('decimals'),
    ExtendedLayout.publicKey('mintAuthority'),
    BufferLayout.u8('freezeAuthorityOption'),
    ExtendedLayout.publicKey('freezeAuthority')
  ]),
  'initializeMint'
)
TOKEN_PROGRAM_LAYOUT.addVariant(1, BufferLayout.struct([]), 'initializeAccount')
TOKEN_PROGRAM_LAYOUT.addVariant(
  3,
  BufferLayout.struct([BufferLayout.nu64('amount')]),
  'transfer'
)
TOKEN_PROGRAM_LAYOUT.addVariant(
  7,
  BufferLayout.struct([BufferLayout.nu64('amount')]),
  'mintTo'
)
TOKEN_PROGRAM_LAYOUT.addVariant(
  8,
  BufferLayout.struct([BufferLayout.nu64('amount')]),
  'burn'
)

const SYSTEM_PROGRAM_LAYOUT = BufferLayout.union(BufferLayout.u32('instruction'))
SYSTEM_PROGRAM_LAYOUT.addVariant(
  0,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.ns64('lamports'),
    BufferLayout.ns64('space'),
    ExtendedLayout.publicKey('programId'),
  ]),
  'createAccount'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  1,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    ExtendedLayout.publicKey('programId'),
  ]),
  'assign'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  2,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.ns64('lamports'),
  ]),
  'transfer'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  3,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.blob(32, 'base'),
    ExtendedLayout.rustString('seed'),
    BufferLayout.ns64('lamports'),
    BufferLayout.ns64('space'),
    ExtendedLayout.publicKey('programId'),
  ]),
  'createAccountWithSeed'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  4,
  BufferLayout.struct([BufferLayout.u32('instruction')]),
  'advanceNonceAccount'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  5,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.ns64('lamports'),
  ]),
  'withdrawNonceAccount'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  6,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.blob(32, 'authorized'),
  ]),
  'initializeNonceAccount'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  7,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.blob(32, 'authorized'),
  ]),
  'authorizeNonceAccount'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  8,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.ns64('space'),
  ]),
  'allocateAccount'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  9,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.blob(32, 'base'),
    ExtendedLayout.rustString('seed'),
    BufferLayout.ns64('space'),
    ExtendedLayout.publicKey('programId'),
  ]),
  'allocateAccountWithSeed'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  10,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.blob(32, 'base'),
    ExtendedLayout.rustString('seed'),
    ExtendedLayout.publicKey('programId'),
  ]),
  'assignAccountWithSeed'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  11,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.ns64('lamports'),
    ExtendedLayout.rustString('seed'),
    ExtendedLayout.publicKey('programId'),
  ]),
  'transferWithSeed'
)

export class SolanaService {

  static encodeMultisigInstruction(method: string, instruction: any
  ): Buffer {
    return encodeAnchorInstruction(method, instruction, MULTISIG_LAYOUT)
  }

  static encodeTokenInstruction(instruction: any
  ): Buffer {
    return encodeInstruction(instruction, TOKEN_PROGRAM_LAYOUT)
  }

  static encodeSystemProgramInstruction(instruction: any
  ): Buffer {
    return encodeInstruction(instruction, SYSTEM_PROGRAM_LAYOUT)
  }

  static async getAccountBalance(connection: Connection, address: PublicKey) {
    const lamports = await connection.getBalance(address)
    const sols = lamports / 1000000000
    console.log(`Account ${address.toBase58()} have ${lamports} lamports (${sols} SOLs)`)
  }

  static async getSigningAddress(seedAddress: PublicKey, programAddress: PublicKey): Promise<[PublicKey, number]> {
    const [address, nonce] = await PublicKey.findProgramAddress([seedAddress.toBuffer()], programAddress)
    console.log('Signing address: ', address.toBase58(), nonce)
    return [address, nonce]
  }

  static async generateKeypairFromSeed(fromPublicKey: PublicKey,
    seed: string,
    programId: PublicKey
  ): Promise<Keypair> {
    const seedPubKey = await PublicKey.createWithSeed(fromPublicKey, seed, programId);
    const seedBytes = seedPubKey.toBytes()
    return Keypair.fromSeed(seedBytes)
  }

  static async isAddressInUse(connection: Connection, address: PublicKey
  ): Promise<boolean> {
    const programInf = await connection.getAccountInfo(address)
    return programInf !== null
  }

  static async isProgramAccount(connection: Connection, address: PublicKey
  ): Promise<boolean> {
    const programInf = await connection.getAccountInfo(address)
    if (programInf === null) {
      console.log(`Program ${address.toBase58()} does not exist`)
      return false
    }
    else if (!programInf.executable) {
      console.log(`Program ${address.toBase58()} is not executable`)
      return false
    }
    return true
  }
}

function encodeAnchorInstruction(method: string, instruction: any, layout: BufferLayout.Union
): Buffer {
  const prefix = HashService.sha256(`global:${method}`)
  const truncatedPrefix = prefix.slice(0, 8)
  const instructionMaxSpan = Math.max(...Object.values(layout.registry).map((r: any) => r.span))
  const buffer = Buffer.alloc(instructionMaxSpan)
  const span = layout.encode(instruction, buffer)
  return Buffer.from([...truncatedPrefix, ...buffer.slice(0, span)])
}

function encodeInstruction(instruction: any, layout: BufferLayout.Union
  ): Buffer {
    const instructionMaxSpan = Math.max(...Object.values(layout.registry).map((r: any) => r.span))
    const buffer = Buffer.alloc(instructionMaxSpan)
    const span = layout.encode(instruction, buffer)
    return buffer.slice(0, span)
  }

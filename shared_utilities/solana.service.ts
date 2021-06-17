import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import * as BufferLayout from './buffer-layout'

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

const SYSTEM_PROGRAM_LAYOUT = BufferLayout.union(BufferLayout.u32('instruction'))
SYSTEM_PROGRAM_LAYOUT.addVariant(
  0,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.ns64('lamports'),
    BufferLayout.ns64('space'),
    BufferLayout.publicKey('programId'),
  ]),
  'createAccount'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  1,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.publicKey('programId'),
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
    BufferLayout.rustString('seed'),
    BufferLayout.ns64('lamports'),
    BufferLayout.ns64('space'),
    BufferLayout.publicKey('programId'),
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
    BufferLayout.rustString('seed'),
    BufferLayout.ns64('space'),
    BufferLayout.publicKey('programId'),
  ]),
  'allocateAccountWithSeed'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  10,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.blob(32, 'base'),
    BufferLayout.rustString('seed'),
    BufferLayout.publicKey('programId'),
  ]),
  'assignAccountWithSeed'
)
SYSTEM_PROGRAM_LAYOUT.addVariant(
  11,
  BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.ns64('lamports'),
    BufferLayout.rustString('seed'),
    BufferLayout.publicKey('programId'),
  ]),
  'transferWithSeed'
)

export class SolanaService {
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

import { Connection, Keypair, PublicKey } from '@solana/web3.js'

export class SolanaService {
  static async getAccountBalance(connection: Connection, address: PublicKey) {
    const lamports = await connection.getBalance(address)
    const sols = lamports / 1000000000
    console.log(`Account ${address.toBase58()} have ${lamports} lamports (${sols} SOLs)`)
  }

  static async getMinimumBalanceForRentExemption(connection: Connection, space: number
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(space)
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

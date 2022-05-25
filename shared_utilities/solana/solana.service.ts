import { Connection, Keypair, PublicKey } from '@solana/web3.js';

export class SolanaService {

  static async getAccountBalance(connection: Connection, address: PublicKey) {
    const lamports = await connection.getBalance(address)
    const sols = lamports / 1000000000
    console.log(`Account ${address.toBase58()} have ${lamports} lamports (${sols} SOLs)`, '\n')
  }

  static async getMinimumBalanceForRentExemption(connection: Connection, space: number
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(space)
  }

  static async generateKeypairFromSeed(fromPublicKey: PublicKey,
    seed: string,
    programId: PublicKey
  ): Promise<Keypair> {
    const seedPubKey = await PublicKey.createWithSeed(fromPublicKey, seed, programId);
    const seedBytes = seedPubKey.toBytes()
    return Keypair.fromSeed(seedBytes)
  }

  static async isAddressAvailable(connection: Connection, address: PublicKey
  ): Promise<boolean> {
    const programInf = await connection.getAccountInfo(address)
    return programInf === null
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
      console.log(`Program ${address.toBase58()} does not exist`, '\n')
      return false
    }
    else if (!programInf.executable) {
      console.log(`Program ${address.toBase58()} is not executable`, '\n')
      return false
    }
    return true
  }
}

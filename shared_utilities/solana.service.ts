import { BpfLoader, BPF_LOADER_PROGRAM_ID, Connection, Keypair, PublicKey } from '@solana/web3.js'
import { FileSystemService } from './file_system.service';

export class SolanaService {
  static async deploy(
    connection: Connection,
    payerAccount: Keypair,
    programAccount: Keypair,
    compiledFilePath: string,
  ) {
    const data = await FileSystemService.readFromFile(compiledFilePath)
    await BpfLoader.load(
      connection,
      payerAccount,
      programAccount,
      data,
      BPF_LOADER_PROGRAM_ID,
    )
    console.log(`Program loaded to ${programAccount.publicKey.toBase58()}`, '\n')
  }

  static async getAccountBalance(connection: Connection, address: PublicKey) {
    const lamports = await connection.getBalance(address)
    const sols = lamports / 1000000000
    console.log(`Account ${address.toBase58()} have ${lamports} lamports (${sols} SOLs)`, '\n')
  }

  static async getMinimumBalanceForRentExemption(connection: Connection, space: number
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(space)
  }

  static async getSigningAddress(seedAddress: PublicKey, programAddress: PublicKey): Promise<[PublicKey, number]> {
    const [address, nonce] = await PublicKey.findProgramAddress([seedAddress.toBuffer()], programAddress)
    console.log(`Signing address for program ${programAddress.toBase58()}: `, address.toBase58(), nonce, '\n')
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

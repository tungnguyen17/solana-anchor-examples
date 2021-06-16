import fs from 'mz/fs'
import os from 'os'
import path from 'path'
import yaml from 'yaml'

import { Keypair } from '@solana/web3.js'

const CONFIG_FILE_PATH = path.resolve(os.homedir(), '.config', 'solana', 'cli', 'config.yml')

export class SolanaConfigService {

  static async getDefaultAccount(): Promise<Keypair> {
    try {
      const config = await SolanaConfigService.readSolanaConfig();
      if (!config.keypair_path) throw new Error('Missing keypair path');
      return SolanaConfigService.readAccountFromFile(config.keypair_path);
    } catch (err) {
      console.warn(
        'Failed to read keypair from CLI config file, falling back to new random keypair',
      );
      return new Keypair();
    }
  }

  static async getRpcUrl(): Promise<string> {
    try {
      const config = await SolanaConfigService.readSolanaConfig();
      if (!config.json_rpc_url) throw new Error('Missing RPC URL')
      return config.json_rpc_url
    } catch (err) {
      console.warn(
        'Failed to read RPC url from CLI config file, falling back to localhost',
      )
      return 'http://localhost:8899'
    }
  }

  static async readAccountFromFile(filePath: string): Promise<Keypair> {
    const keypairString = await fs.readFile(filePath, { encoding: 'utf8' })
    const keypairBuffer = Buffer.from(JSON.parse(keypairString))
    return Keypair.fromSecretKey(keypairBuffer)
  }

  static async readSolanaConfig(): Promise<any> {
    const configYml = await fs.readFile(CONFIG_FILE_PATH, { encoding: 'utf8' });
    return yaml.parse(configYml);
  }

  static async writeAccountToFile(filePath: string, account: Keypair) {
    const keypairBuffer = Buffer.from(account.secretKey)
    const keypairString = JSON.stringify(keypairBuffer.toJSON().data)
    await fs.writeFile(filePath, keypairString, { encoding: 'utf8' })
  }

  static async writeAccountToFolder(folderPath: string, account: Keypair) {
    const keypairBuffer = Buffer.from(account.secretKey)
    const keypairString = JSON.stringify(keypairBuffer.toJSON().data)
    const filePath = path.join(folderPath, `${account.publicKey.toBase58()}.json`)
    await fs.writeFile(filePath, keypairString, { encoding: 'utf8' })
  }
}

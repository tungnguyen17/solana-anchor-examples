import { Keypair } from "@solana/web3.js";
import path from 'path';
import { FileSystemService } from './file_system.service';
import { SolanaConfigService } from './solana_config.service';

export class TestAccountService {
  static async getAccount(num: number
  ): Promise<Keypair> {
    return getExistAccountOrCreateNew(`test_account_${num}.json`)
  }

  static async getTokenAccount(num: number
  ): Promise<Keypair> {
    return getExistAccountOrCreateNew(`token_account_${num}.json`)
  }
}

async function getExistAccountOrCreateNew(
  fileName: string
): Promise<Keypair> {
  const accountPath = path.join(__dirname, '..', 'shared_accounts', fileName)
  const isAccountExists = await FileSystemService.exists(accountPath)
  const account = isAccountExists
    ? await SolanaConfigService.readAccountFromFile(accountPath)
    : Keypair.generate()
  if (!isAccountExists) {
    SolanaConfigService.writeAccountToFile(accountPath, account)
  }
  return account
}

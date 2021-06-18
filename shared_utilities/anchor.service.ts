import { Program, web3 } from '@project-serum/anchor';
import { FileSystemService } from './file_system.service';

export class AnchorService {

  static async loadProgram(idlFilePath: string, address: web3.PublicKey): Promise<Program> {
    const idlJson = await FileSystemService.readTextFromFile(idlFilePath);
    const idl = JSON.parse(idlJson)
    console.log(`Program account: ${address.toBase58()}`)
    return new Program(idl, address)
  }
}

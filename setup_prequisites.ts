import path from 'path'
import { FileSystemService } from './shared_utilities/filesystem.service'

const samples: string[] = [
  'transfer_spl_token_example'
];

(async function () {
  for(let sample of samples) {
    const sourcePath = path.join(__dirname, 'node_modules')
    const targetPath = path.join(__dirname, sample, 'node_modules')
    await FileSystemService.createSymbolicLink(sourcePath, targetPath, 'junction')
  }
})()

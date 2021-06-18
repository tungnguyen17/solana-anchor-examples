import path from 'path'
import { FileSystemService } from './shared_utilities/file_system.service'

const samples: string[] = [
  'cross_program_invocation_example',
  'indirect_transfer_example'
];

(async function () {
  for(let sample of samples) {
    const sourcePath = path.join(__dirname, 'node_modules')
    const targetPath = path.join(__dirname, sample, 'node_modules')
    await FileSystemService.createSymbolicLink(sourcePath, targetPath, 'junction')
  }
})()

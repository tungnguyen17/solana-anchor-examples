import path from 'path'
import { FileSystemService } from './shared-utilities/filesystem.service'

const samples: string[] = [
];

(async function () {
  for(let sample of samples) {
    const sourcePath = path.join(__dirname, 'node_modules')
    const targetPath = path.join(__dirname, sample, 'node_modules')
    await FileSystemService.createSymbolicLink(sourcePath, targetPath, 'junction')
  }
})()

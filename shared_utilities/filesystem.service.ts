import fs from 'mz/fs'

export class FileSystemService {
  static async createSymbolicLink(sourcePath: string, tartgetPath: string, type: string) {
    if (await fs.exists(tartgetPath)) {
      try {
        await fs.unlink(tartgetPath)
      }
      catch (err) { }
    }
    await fs.symlink(sourcePath, tartgetPath, type)
  }

  static async readFromFile(path: string) {
    await fs.readFile(path, { encoding: 'utf8' })
  }

  static async writeToFile(path: string, content: string) {
    await fs.writeFile(path, content, { encoding: 'utf8' })
  }
}

import { Buffer } from 'buffer'
import * as BufferLayout from './buffer-layout'
import { HashService } from './hash.service'

export class BufferLayoutService {
  static encodeAnchorInstruction(method: string, instruction: any, layout: BufferLayout.Union
  ): Buffer {
    const prefix = HashService.sha256(`global:${method}`)
    const truncatedPrefix = prefix.slice(0, 8)
    const instructionMaxSpan = Math.max(...Object.values(layout.registry).map((r: any) => r.span))
    const buffer = Buffer.alloc(instructionMaxSpan)
    const span = layout.encode(instruction, buffer)
    return Buffer.from([...truncatedPrefix, ...buffer.slice(0, span)])
  }

  static encodeInstruction(instruction: any, layout: BufferLayout.struct
  ): Buffer {
    const buffer = Buffer.alloc(layout.span)
    const span = layout.encode(instruction, buffer)
    return buffer.slice(0, span)
  }

  static encodeUnionInstruction(instruction: any, layout: BufferLayout.Union
  ): Buffer {
    const instructionMaxSpan = Math.max(...Object.values(layout.registry).map((r: any) => r.span))
    const buffer = Buffer.alloc(instructionMaxSpan)
    const span = layout.encode(instruction, buffer)
    return buffer.slice(0, span)
  }
}

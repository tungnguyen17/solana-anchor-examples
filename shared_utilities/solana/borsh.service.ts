import * as borsh from '@project-serum/borsh';
import { HashService } from '../hash.service';

export class BorshService {
  static anchorSerialize<T>(
    method: string,
    layout: borsh.Layout<T>,
    data: T,
    maxSpan: number,
  ): Buffer {
    const prefix = HashService.sha256(`global:${method}`)
    const truncatedPrefix = prefix.slice(0, 8)
    const buffer = Buffer.alloc(maxSpan)
    const span = layout.encode(data, buffer);
    return Buffer.from([...truncatedPrefix, ...buffer.slice(0, span)])
  }

  static anchorDeserialize<T>(
    layout: borsh.Layout<T>,
    data: Buffer,
  ): T {
    return layout.decode(data.slice(8))
  }

  static deserialize<T>(
    layout: borsh.Layout<T>,
    data: Buffer,
  ): T {
    return layout.decode(data)
  }

  static serialize<T>(
    layout: borsh.Layout<T>,
    data: T,
    maxSpan: number,
  ): Buffer {
    const buffer = Buffer.alloc(maxSpan)
    const span = layout.encode(data, buffer);
    return buffer.slice(0, span)
  }
}

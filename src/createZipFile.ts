// import * as fs from "fs";
import { CRC32 } from "./CRC32";

export type IFile = {
  name: string | Uint8Array;
  data: string | Uint8Array;
  startPos?: number;
};

class Buf {
  public dataView: DataView;
  public buffer: ArrayBuffer;
  public byteOffset = 0;
  constructor(size: number) {
    this.buffer = new ArrayBuffer(size);
    this.dataView = new DataView(this.buffer);
  }
  public setInt16(n: number) {
    this.dataView.setUint16(this.byteOffset, n, true);
    this.byteOffset += 2;
    return this;
  }
  public setInt32(n: number) {
    this.dataView.setUint32(this.byteOffset, n, true);
    this.byteOffset += 4;
    return this;
  }
}

const stringToUint8Array = (data: string | Uint8Array) =>
  data instanceof Uint8Array ? data : new TextEncoder().encode(data);

export const createZipFile = (fileList: IFile[]) => {
  let headTotalSize = 0;
  let centralDirectoryTotalSize = 0;
  const files = fileList.map(file => {
    const name = stringToUint8Array(file.name);
    const data = stringToUint8Array(file.data);
    const startPos = headTotalSize;
    const crc32 = CRC32(data);
    headTotalSize += 30 + name.length + data.length;
    centralDirectoryTotalSize += 46 + name.length;
    return { name, data, startPos, crc32 };
  });

  const bufs: Uint8Array[] = [];

  /** 本地文件头 */
  for (const { name, data, crc32 } of files) {
    const buf = new Buf(30);
    buf.setInt32(0x04034b50);
    /** 压缩所用的pkware版本 */
    buf.setInt16(0x0a);

    buf.byteOffset = 14;
    /** CRC-32 */
    buf.setInt32(crc32);
    /** 压缩后的大小 */
    buf.setInt32(data.length);
    /** 未压缩大小 */
    buf.setInt32(data.length);
    /** 文件名长度 */
    buf.setInt16(name.length);
    bufs.push(new Uint8Array(buf.buffer));
    bufs.push(name);
    bufs.push(data);
  }

  /** 中央目录文件头 */
  for (const { name, data, crc32, startPos } of files) {
    const buf = new Buf(46);
    buf.setInt32(0x02014b50);
    buf.setInt16(0x3f);
    /** 压缩所用的pkware版本 */
    buf.setInt16(0x0a);

    buf.byteOffset = 16;
    /** CRC-32 */
    buf.setInt32(crc32);
    /** 压缩后的大小 */
    buf.setInt32(data.length);
    /** 未压缩大小 */
    buf.setInt32(data.length);
    /** 文件名长度 */
    buf.setInt16(name.length);
    buf.byteOffset = 42;
    /** 本地文件头的相对偏移量 */
    buf.setInt32(startPos);
    bufs.push(new Uint8Array(buf.buffer));
    bufs.push(name);
  }

  /** 中央目录记录结束 */
  if (1) {
    const buf = new Buf(22);
    buf.setInt32(0x06054b50);
    buf.byteOffset = 8;
    /** 此磁盘上的中心目录记录数 */
    buf.setInt16(files.length);
    /** 中央目录记录总数 */
    buf.setInt16(files.length);
    /** 中央目录的大小（字节） */
    buf.setInt32(centralDirectoryTotalSize);
    /** 中央目录开始的偏移量 */
    buf.setInt32(headTotalSize);
    bufs.push(new Uint8Array(buf.buffer));
  }
  return bufs;
};

/** 测试用例 */
// const f = fs.createWriteStream("2.zip");
// for (const c of createZipFile([{ name: "1.txt", data: "666" }])) {
//   f.write(c);
// }
// setTimeout(() => f.end(), 1000);

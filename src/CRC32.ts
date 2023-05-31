export const CRC32 = (() => {
  // 查表法 预先构建一张表
  // 在CRC-16和32中，一次移出的待测数据为 8 位 bits，即一次进行一个字节的计算，
  // 则表格有 2^8＝256 个表值。一个字节有8位二进制数，每一位都有2种选择。
  const table: Uint32Array = new Uint32Array(256);
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var k = 0; k < 8; k++) {
      c =
        c & 1 // LSM为1
          ? (c >>> 1) ^ 0xedb88320 //采取反向校验
          : c >>> 1; //对应 上文 否则仅将寄存器右移1位
    }
    table[i] = c;
  }

  return function (bytes: Uint8Array, start: number = 0, length: number = bytes.length - start) {
    // 上面是用来取需要检验的位置
    var crc = -1;
    for (var i = start, l = start + length; i < l; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xff];
    }
    return crc ^ -1;
  };
})();

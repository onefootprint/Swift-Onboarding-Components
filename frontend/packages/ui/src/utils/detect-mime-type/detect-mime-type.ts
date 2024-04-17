import type { Buffer } from 'buffer';

const magicNumbers = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'image/jpeg': [0xff, 0xd8, 0xff, 0xe0],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
};

const detectMimeType = (bytes: Buffer): string => {
  for (const [mimeType, magicNumber] of Object.entries(magicNumbers)) {
    if (
      bytes
        .subarray(0, magicNumber.length)
        .every((byte, i) => byte === magicNumber[i])
    ) {
      return mimeType;
    }
  }
  return 'application/octet-stream';
};

export default detectMimeType;

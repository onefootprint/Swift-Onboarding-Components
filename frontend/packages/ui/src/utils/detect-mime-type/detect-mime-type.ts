import type { Buffer } from 'buffer';

const magicNumbers = {
  'application/pdf': {
    signature: [0x25, 0x50, 0x44, 0x46],
    offset: 0,
  },
  'image/jpeg': {
    signature: [0xff, 0xd8, 0xff, 0xe0],
    offset: 0,
  },
  'image/png': {
    signature: [0x89, 0x50, 0x4e, 0x47],
    offset: 0,
  },
  'image/gif': {
    signature: [0x47, 0x49, 0x46, 0x38],
    offset: 0,
  },
  'image/heic': {
    signature: [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63],
    offset: 4,
  },
};

const detectMimeType = (bytes: Buffer): string => {
  for (const [mimeType, { signature, offset }] of Object.entries(magicNumbers)) {
    if (bytes.subarray(offset, offset + signature.length).every((byte, i) => byte === signature[i])) {
      return mimeType;
    }
  }
  return 'application/octet-stream';
};

export default detectMimeType;

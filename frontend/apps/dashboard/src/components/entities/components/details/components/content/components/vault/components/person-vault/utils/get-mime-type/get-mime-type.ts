const getMimeType = (base64String: string): string | null => {
  try {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    if (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    ) {
      return 'application/pdf'; // PDF files start with '%PDF'
    }

    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return 'image/jpeg'; // JPEG files start with 0xFFD8FF
    }

    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return 'image/png'; // PNG files start with 0x89504E47
    }

    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return 'image/gif'; // GIF files start with 'GIF'
    }

    return 'image/jpeg';
  } catch (e) {
    return 'image/jpeg';
  }
};

export default getMimeType;

import getMimeType from './get-mime-type';

describe('getMimeType', () => {
  it('should return application/pdf for a PDF Base64 string', () => {
    const pdfBase64 = 'JVBER'; // Truncated Base64 for '%PDF'
    expect(getMimeType(pdfBase64)).toBe('application/pdf');
  });

  it('should return image/jpeg for a JPEG Base64 string', () => {
    const jpegBase64 = '/9j/'; // Truncated Base64 for JPEG magic number
    expect(getMimeType(jpegBase64)).toBe('image/jpeg');
  });

  it('should return image/png for a PNG Base64 string', () => {
    const pngBase64 = 'iVBOR'; // Truncated Base64 for PNG magic number
    expect(getMimeType(pngBase64)).toBe('image/png');
  });

  it('should return image/gif for a GIF Base64 string', () => {
    const gifBase64 = 'R0lG'; // Truncated Base64 for 'GIF'
    expect(getMimeType(gifBase64)).toBe('image/gif');
  });

  it('should return null for an unsupported or invalid Base64 string', () => {
    const invalidBase64 = 'invalidString';
    expect(getMimeType(invalidBase64)).toBeNull();
  });
});
